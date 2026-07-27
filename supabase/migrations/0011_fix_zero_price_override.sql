-- =============================================================
-- Naz's Collection — 0011 Fix zero price_override wiping catalog price
-- Empty admin "Price override" fields were saved as 0; coalesce(0, …)
-- then stored unit_price = 0 on orders and carts.
-- =============================================================

-- Clear bogus overrides so product base/discount price applies.
update public.product_variants
set price_override = null
where price_override is not null and price_override <= 0;

create or replace function public.create_order(
  p_customer_name    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_shipping_address jsonb,
  p_payment_method   text,
  p_user_id          uuid,
  p_items            jsonb
)
returns table (order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id       uuid;
  v_order_number   text;
  v_total          numeric(10, 2) := 0;
  v_shipping       numeric(10, 2) := 0;
  v_base_shipping  numeric(10, 2) := 0;
  v_city           text;
  v_item           jsonb;
  v_variant_id     uuid;
  v_quantity       int;
  v_product_id     uuid;
  v_unit_price     numeric(10, 2);
  v_stock          int;
  v_weight         numeric(10, 2);
  v_weight_grams   numeric(12, 2) := 0;
  v_billable_kg    int := 1;
  v_address        jsonb;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  if p_payment_method not in ('COD', 'Card') then
    raise exception 'Invalid payment method: %', p_payment_method;
  end if;

  v_city := lower(trim(coalesce(p_shipping_address ->> 'city', '')));
  if v_city = '' then
    raise exception 'Shipping city is required';
  end if;

  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, user_id, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, payment_status, order_status, total_amount
  ) values (
    v_order_number, p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, p_payment_method, 'pending', 'pending', 0
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item ->> 'variant_id')::uuid;
    v_quantity   := (v_item ->> 'quantity')::int;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for variant %', v_variant_id;
    end if;

    select
      v.product_id,
      case
        when v.price_override is not null and v.price_override > 0
          then v.price_override
        when p.discount_price is not null
          and p.discount_price > 0
          and (p.base_price is null or p.discount_price < p.base_price)
          then p.discount_price
        else p.base_price
      end,
      v.stock_quantity,
      coalesce(p.weight, 0)
    into v_product_id, v_unit_price, v_stock, v_weight
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = v_variant_id
    for update;

    if not found then
      raise exception 'Variant % not found', v_variant_id;
    end if;

    if v_stock < v_quantity then
      raise exception 'Insufficient stock for variant % (have %, need %)',
        v_variant_id, v_stock, v_quantity;
    end if;

    update public.product_variants
      set stock_quantity = stock_quantity - v_quantity
      where id = v_variant_id;

    insert into public.order_items (order_id, product_id, variant_id, quantity, unit_price)
    values (v_order_id, v_product_id, v_variant_id, v_quantity, v_unit_price);

    v_total := v_total + (v_unit_price * v_quantity);
    v_weight_grams := v_weight_grams + (v_weight * v_quantity);
  end loop;

  if v_weight_grams <= 0 then
    v_billable_kg := 1;
  else
    v_billable_kg := ceil(v_weight_grams / 1000.0)::int;
    if v_billable_kg < 1 then
      v_billable_kg := 1;
    end if;
  end if;

  if v_city = 'karachi' then
    v_base_shipping := 350;
  else
    v_base_shipping := 450;
  end if;

  v_shipping := v_base_shipping + (v_billable_kg - 1) * (v_base_shipping / 2.0);

  v_address := p_shipping_address || jsonb_build_object(
    'shipping_fee', v_shipping,
    'base_shipping_fee', v_base_shipping,
    'weight_grams', v_weight_grams,
    'billable_kg', v_billable_kg
  );

  update public.orders
    set total_amount = v_total + v_shipping,
        shipping_address = v_address
    where id = v_order_id;

  return query select v_order_id, v_order_number;
end;
$$;

grant execute on function public.create_order(
  text, text, text, jsonb, text, uuid, jsonb
) to anon, authenticated;

-- Repair past order lines that stored unit_price 0 from the bug.
update public.order_items oi
set unit_price = case
  when v.price_override is not null and v.price_override > 0 then v.price_override
  when p.discount_price is not null
    and p.discount_price > 0
    and (p.base_price is null or p.discount_price < p.base_price)
    then p.discount_price
  else p.base_price
end
from public.product_variants v
join public.products p on p.id = v.product_id
where oi.variant_id = v.id
  and oi.unit_price <= 0;

-- Recompute order totals = items + shipping_fee (when present).
update public.orders o
set total_amount = coalesce(items.subtotal, 0)
  + coalesce((o.shipping_address ->> 'shipping_fee')::numeric, 0)
from (
  select order_id, sum(unit_price * quantity) as subtotal
  from public.order_items
  group by order_id
) items
where o.id = items.order_id
  and exists (
    select 1 from public.order_items oi
    where oi.order_id = o.id
  );
