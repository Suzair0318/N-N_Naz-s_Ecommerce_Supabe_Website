-- =============================================================
-- Naz's Collection — 0004 Functions
-- Transactional order creation with stock validation & decrement.
-- Run after 0003.
-- =============================================================

-- Generate a human-friendly, collision-checked order number.
create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := 'NAZ-' || to_char(now(), 'YYYYMMDD') || '-' ||
                 lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.orders where order_number = candidate);
  end loop;
  return candidate;
end;
$$;

-- Create an order atomically.
-- p_items: jsonb array of { "variant_id": uuid, "quantity": int }
-- Prices are resolved server-side from the DB (never trusted from client).
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
  v_order_id     uuid;
  v_order_number text;
  v_total        numeric(10, 2) := 0;
  v_shipping     numeric(10, 2) := 0;
  v_city         text;
  v_item         jsonb;
  v_variant_id   uuid;
  v_quantity     int;
  v_product_id   uuid;
  v_unit_price   numeric(10, 2);
  v_stock        int;
  v_address      jsonb;
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

  -- Karachi = 350 PKR, all other cities = 400 PKR
  if v_city = 'karachi' then
    v_shipping := 350;
  else
    v_shipping := 400;
  end if;

  v_address := p_shipping_address || jsonb_build_object('shipping_fee', v_shipping);
  v_order_number := public.generate_order_number();

  insert into public.orders (
    order_number, user_id, customer_name, customer_email, customer_phone,
    shipping_address, payment_method, payment_status, order_status, total_amount
  ) values (
    v_order_number, p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    v_address, p_payment_method, 'pending', 'pending', 0
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item ->> 'variant_id')::uuid;
    v_quantity   := (v_item ->> 'quantity')::int;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for variant %', v_variant_id;
    end if;

    -- Lock the variant row and resolve authoritative price + stock.
    select
      v.product_id,
      coalesce(v.price_override, p.discount_price, p.base_price),
      v.stock_quantity
    into v_product_id, v_unit_price, v_stock
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
  end loop;

  update public.orders
    set total_amount = v_total + v_shipping
    where id = v_order_id;

  return query select v_order_id, v_order_number;
end;
$$;

-- Allow both guests (anon) and authenticated users to place orders.
grant execute on function public.create_order(
  text, text, text, jsonb, text, uuid, jsonb
) to anon, authenticated;
