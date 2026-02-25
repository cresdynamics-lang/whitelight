-- Admin login helper function for Supabase
-- Uses the admins table and pgcrypto to validate the password.
-- This is intended to be called from the frontend via Supabase RPC.

create or replace function public.admin_login(
  p_email text,
  p_password text
)
returns table (
  id bigint,
  email text,
  username text,
  role text
) as $$
declare
  admin_row public.admins;
begin
  -- Look up admin by email (disambiguate column reference)
  select a.*
  into admin_row
  from public.admins as a
  where a.email = p_email
  limit 1;

  if not found then
    -- No such user; return empty result
    return;
  end if;

  -- Validate password using pgcrypto's crypt()
  if admin_row.password_hash = crypt(p_password, admin_row.password_hash) then
    id := admin_row.id;
    email := admin_row.email;
    username := admin_row.username;
    role := admin_row.role;
    return next;
  end if;

  -- Password mismatch; return empty result
  return;
end;
$$ language plpgsql
security definer
set search_path = public, extensions, pg_temp;

