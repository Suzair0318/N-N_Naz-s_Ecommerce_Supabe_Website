-- =============================================================
-- Naz's Collection — 0008 Order confirmation RPC
-- Lets guests (and logged-in users) load an order by UUID after
-- checkout without needing the service_role key.
-- Safe because order IDs are unguessable UUIDs.
-- =============================================================

create or replace function public.get_order_confirmation(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order jsonb;
  v_items jsonb;
begin
  select to_jsonb(o.*)
  into v_order
  from public.orders o
  where o.id = p_order_id;

  if v_order is null then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      to_jsonb(oi.*) || jsonb_build_object(
        'product', (
          select jsonb_build_object('title', p.title, 'slug', p.slug)
          from public.products p
          where p.id = oi.product_id
        ),
        'variant', (
          select jsonb_build_object('size', v.size)
          from public.product_variants v
          where v.id = oi.variant_id
        )
      )
      order by oi.id
    ),
    '[]'::jsonb
  )
  into v_items
  from public.order_items oi
  where oi.order_id = p_order_id;

  return v_order || jsonb_build_object('items', v_items);
end;
$$;

grant execute on function public.get_order_confirmation(uuid) to anon, authenticated;
