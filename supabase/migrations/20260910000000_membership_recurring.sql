-- Recurring membership billing (Wompi payment sources)

alter table public.memberships
  add column if not exists product_key text,
  add column if not exists wompi_payment_source_id text,
  add column if not exists renew boolean not null default true,
  add column if not exists card_last_four text,
  add column if not exists canceled_at timestamptz;

create index if not exists memberships_renewal_idx
  on public.memberships (ends_at)
  where renew = true
    and canceled_at is null
    and wompi_payment_source_id is not null;
