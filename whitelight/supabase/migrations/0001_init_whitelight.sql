-- Whitelight initial Supabase schema
-- Products, product images, variants, and admin user seed

-- Enable pgcrypto for password hashing (safe if already enabled)
create extension if not exists pgcrypto with schema public;

-- Product category enum (idempotent)
do $$
begin
  create type product_category as enum (
    'running',
    'trail',
    'gym',
    'basketball',
    'accessories',
    'training'
  );
exception
  when duplicate_object then null;
end $$;

-- PRODUCTS TABLE
create table if not exists public.products (
  id              bigserial primary key,
  slug            text not null unique,
  name            text not null,
  brand           text not null default '',
  category        product_category not null default 'running',
  categories      product_category[] default '{}',
  price           numeric(12,2) not null default 0,
  original_price  numeric(12,2),
  description     text not null default '',
  tags            text[] not null default '{}',
  is_new          boolean not null default false,
  is_best_seller  boolean not null default false,
  is_on_offer     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes to support common filters
create index if not exists idx_products_category
  on public.products (category);

create index if not exists idx_products_is_new
  on public.products (is_new);

create index if not exists idx_products_is_best_seller
  on public.products (is_best_seller);

create index if not exists idx_products_created_at
  on public.products (created_at desc);

-- Keep updated_at in sync
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_at on public.products;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_current_timestamp_updated_at();


-- PRODUCT IMAGES TABLE
create table if not exists public.product_images (
  id          bigserial primary key,
  product_id  bigint not null references public.products(id) on delete cascade,
  url         text not null,
  alt_text    text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_product_images_product_id
  on public.product_images (product_id);


-- PRODUCT VARIANTS TABLE
-- Note: size stored as text so it supports both numeric shoe sizes and string labels (e.g. "M", "L")
create table if not exists public.product_variants (
  id             bigserial primary key,
  product_id     bigint not null references public.products(id) on delete cascade,
  size           text not null,
  in_stock       boolean not null default true,
  stock_quantity integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id
  on public.product_variants (product_id);

drop trigger if exists set_product_variants_updated_at on public.product_variants;

create trigger set_product_variants_updated_at
before update on public.product_variants
for each row
execute function public.set_current_timestamp_updated_at();


-- ADMINS TABLE (for admin login)
create table if not exists public.admins (
  id           bigserial primary key,
  email        text not null unique,
  username     text not null,
  password_hash text not null,
  role         text not null default 'admin',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_admins_email
  on public.admins (email);

drop trigger if exists set_admins_updated_at on public.admins;

create trigger set_admins_updated_at
before update on public.admins
for each row
execute function public.set_current_timestamp_updated_at();


-- SEED DEFAULT ADMIN USER
-- Login:   admin@whitelightstore.co.ke
-- Password: Ibrahim@Admin  (stored as a secure hash)
insert into public.admins (email, username, password_hash, role)
values (
  'admin@whitelightstore.co.ke',
  'admin@whitelightstore.co.ke',
  crypt('Ibrahim@Admin', gen_salt('bf')),
  'admin'
)
on conflict (email) do update
set
  username      = excluded.username,
  password_hash = excluded.password_hash,
  updated_at    = now();

