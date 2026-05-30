-- Customer orders (checkout) and line items for admin

create sequence if not exists public.order_number_seq;

create table if not exists public.orders (
  id                bigserial primary key,
  order_number      text not null unique,
  customer_name     text not null,
  customer_phone    text not null,
  customer_email    text,
  delivery_address  text not null,
  delivery_location text not null,
  delivery_location_label text not null,
  delivery_fee      numeric(12, 2) not null default 0,
  subtotal          numeric(12, 2) not null default 0,
  total_amount      numeric(12, 2) not null default 0,
  order_notes       text,
  status            text not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_status on public.orders (status);

create table if not exists public.order_items (
  id              bigserial primary key,
  order_id        bigint not null references public.orders (id) on delete cascade,
  product_id      text not null,
  product_slug    text,
  product_name    text not null,
  product_price   numeric(12, 2) not null,
  size            text not null,
  quantity        integer not null default 1 check (quantity > 0),
  subtotal        numeric(12, 2) not null,
  product_image   text,
  reference_link  text,
  selected_sizes  jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_current_timestamp_updated_at();

-- Place order (anon checkout via Supabase RPC)
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

grant execute on function public.create_store_order(
  text, text, text, text, text, text, numeric, numeric, numeric, text, jsonb
) to anon, authenticated;

-- Admin panel uses the same anon key as the storefront (matches products setup)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders_select_anon" on public.orders;
create policy "orders_select_anon"
  on public.orders for select to anon, authenticated using (true);

drop policy if exists "orders_update_anon" on public.orders;
create policy "orders_update_anon"
  on public.orders for update to anon, authenticated using (true);

drop policy if exists "order_items_select_anon" on public.order_items;
create policy "order_items_select_anon"
  on public.order_items for select to anon, authenticated using (true);
