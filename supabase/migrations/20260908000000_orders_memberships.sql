-- Orders and memberships for Wompi checkout

create type public.order_status as enum ('pending', 'approved', 'declined', 'voided');
create type public.membership_plan as enum ('miembro', 'residente');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  product_key text not null,
  amount_cop integer not null,
  status public.order_status not null default 'pending',
  wompi_transaction_id text unique,
  wall_consent boolean not null default false,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan public.membership_plan not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  creyente_number integer unique,
  wall_name text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_reference_idx on public.orders(reference);
create index memberships_user_id_idx on public.memberships(user_id);
create index memberships_ends_at_idx on public.memberships(ends_at);

alter table public.orders enable row level security;
alter table public.memberships enable row level security;

create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or email = (auth.jwt() ->> 'email'));

create policy "Users read own memberships"
  on public.memberships for select
  using (auth.uid() = user_id);

create policy "Public read wall names"
  on public.memberships for select
  using (wall_name is not null and creyente_number is not null);

create or replace view public.memberships_public_count as
select
  count(*) filter (where creyente_number is not null)::integer as creyentes_taken,
  60::integer as creyentes_max
from public.memberships
where creyente_number is not null;

grant select on public.memberships_public_count to anon, authenticated;

create or replace function public.get_order_status(ref text)
returns table(reference text, status public.order_status, product_key text, amount_cop integer)
language sql
security definer
set search_path = public
as $$
  select o.reference, o.status, o.product_key, o.amount_cop
  from public.orders o
  where o.reference = ref
  limit 1;
$$;

grant execute on function public.get_order_status(text) to anon, authenticated;

create or replace function public.next_creyente_number()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  select coalesce(max(creyente_number), 0) + 1 into n from public.memberships;
  if n > 60 then
    return null;
  end if;
  return n;
end;
$$;
