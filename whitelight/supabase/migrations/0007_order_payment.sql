-- Payment method + optional M-Pesa confirmation code on orders

alter table public.orders
  add column if not exists payment_method text not null default 'mpesa_paybill',
  add column if not exists mpesa_code text;

create or replace function public.create_store_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_delivery_address text,
  p_delivery_location text,
  p_delivery_location_label text,
  p_delivery_fee numeric,
  p_subtotal numeric,
  p_total_amount numeric,
  p_order_notes text,
  p_payment_method text,
  p_mpesa_code text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_order_number text;
  v_item jsonb;
  v_size text;
begin
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'Customer name is required';
  end if;
  if p_customer_phone is null or trim(p_customer_phone) = '' then
    raise exception 'Phone number is required';
  end if;
  if p_delivery_address is null or trim(p_delivery_address) = '' then
    raise exception 'Delivery address is required';
  end if;
  if p_delivery_location is null or trim(p_delivery_location) = '' then
    raise exception 'Delivery location is required';
  end if;
  if p_payment_method is null or trim(p_payment_method) = '' then
    raise exception 'Payment method is required';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item';
  end if;

  v_order_number :=
    'WL' || to_char(now() at time zone 'Africa/Nairobi', 'YYMMDD')
    || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0');

  insert into public.orders (
    order_number,
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    delivery_location,
    delivery_location_label,
    delivery_fee,
    subtotal,
    total_amount,
    order_notes,
    payment_method,
    mpesa_code,
    status
  ) values (
    v_order_number,
    trim(p_customer_name),
    trim(p_customer_phone),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    trim(p_delivery_address),
    trim(p_delivery_location),
    trim(p_delivery_location_label),
    coalesce(p_delivery_fee, 0),
    coalesce(p_subtotal, 0),
    coalesce(p_total_amount, 0),
    nullif(trim(coalesce(p_order_notes, '')), ''),
    trim(p_payment_method),
    nullif(trim(coalesce(p_mpesa_code, '')), ''),
    'pending'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_size := coalesce(v_item->>'size', '40');
    insert into public.order_items (
      order_id,
      product_id,
      product_slug,
      product_name,
      product_price,
      size,
      quantity,
      subtotal,
      product_image,
      reference_link,
      selected_sizes
    ) values (
      v_order_id,
      v_item->>'productId',
      v_item->>'productSlug',
      v_item->>'productName',
      (v_item->>'productPrice')::numeric,
      v_size,
      greatest(1, coalesce((v_item->>'quantity')::int, 1)),
      (v_item->>'subtotal')::numeric,
      v_item->>'productImage',
      v_item->>'referenceLink',
      v_item->'selectedSizes'
    );
  end loop;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number
  );
end;
$$;

-- Drop old 11-parameter overload if it exists (pre-payment migration)
drop function if exists public.create_store_order(
  text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb
);

grant execute on function public.create_store_order(
  text, text, text, text, text, text, numeric, numeric, numeric, text, text, text, jsonb
) to anon, authenticated;
