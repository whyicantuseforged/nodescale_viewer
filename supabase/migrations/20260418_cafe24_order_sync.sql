create table if not exists public.cafe24_product_mappings (
  id uuid primary key default gen_random_uuid(),
  mall_id text not null,
  cafe24_product_no bigint not null,
  product_id uuid not null references public.products(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (mall_id, cafe24_product_no)
);

create index if not exists cafe24_product_mappings_product_id_idx
  on public.cafe24_product_mappings(product_id);

create table if not exists public.cafe24_order_sync_logs (
  id uuid primary key default gen_random_uuid(),
  mall_id text not null,
  order_id text not null,
  payment_confirmed boolean not null default false,
  buyer_email text,
  buyer_name text,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'SUCCEEDED', 'PARTIAL', 'FAILED', 'SKIPPED')),
  processed_items integer not null default 0,
  granted_items integer not null default 0,
  pending_items integer not null default 0,
  skipped_items integer not null default 0,
  error_message text,
  payload jsonb,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (mall_id, order_id)
);

create table if not exists public.pending_package_access_grants (
  id uuid primary key default gen_random_uuid(),
  mall_id text not null,
  external_order_id text not null,
  external_order_item_code text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  purchaser_email text not null,
  purchaser_name text,
  access_days integer not null check (access_days > 0),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'CLAIMED', 'CANCELED')),
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (mall_id, external_order_id, external_order_item_code)
);

create index if not exists pending_package_access_grants_email_idx
  on public.pending_package_access_grants(lower(purchaser_email));

create index if not exists pending_package_access_grants_product_id_idx
  on public.pending_package_access_grants(product_id);

alter table public.cafe24_product_mappings enable row level security;
alter table public.cafe24_order_sync_logs enable row level security;
alter table public.pending_package_access_grants enable row level security;

comment on table public.cafe24_product_mappings is
  'Maps Cafe24 product numbers to viewer products/packages.';

comment on table public.cafe24_order_sync_logs is
  'Tracks order-level sync attempts from Cafe24 into access passes.';

comment on table public.pending_package_access_grants is
  'Stores grants that could not be attached to a Supabase Auth user yet and must be claimed later by matching email.';

create or replace function public.grant_package_access(
  p_user_id uuid,
  p_product_id uuid,
  p_access_days integer
)
returns table (
  pass_id uuid,
  access_start_at timestamptz,
  access_end_at timestamptz
)
language plpgsql
as $$
declare
  v_existing_end_at timestamptz;
  v_start_at timestamptz;
  v_end_at timestamptz;
  v_pass_id uuid;
begin
  if p_access_days is null or p_access_days < 1 then
    raise exception 'access days must be greater than zero';
  end if;

  select pap.access_end_at
    into v_existing_end_at
  from public.package_access_passes pap
  where pap.user_id = p_user_id
    and pap.product_id = p_product_id
    and pap.status = 'ACTIVE'
  order by pap.access_end_at desc
  limit 1
  for update;

  if v_existing_end_at is not null and v_existing_end_at > now() then
    v_start_at := v_existing_end_at;
  else
    v_start_at := now();
  end if;

  v_end_at := v_start_at + make_interval(days => p_access_days);

  insert into public.package_access_passes (
    user_id,
    product_id,
    access_start_at,
    access_end_at,
    status
  )
  values (
    p_user_id,
    p_product_id,
    v_start_at,
    v_end_at,
    'ACTIVE'
  )
  returning id into v_pass_id;

  return query
  select v_pass_id, v_start_at, v_end_at;
end;
$$;

create or replace function public.claim_pending_package_access_grants(
  p_user_id uuid,
  p_email text
)
returns table (
  grant_id uuid,
  product_id uuid,
  pass_id uuid,
  access_start_at timestamptz,
  access_end_at timestamptz
)
language plpgsql
as $$
declare
  v_grant record;
  v_granted record;
begin
  if p_user_id is null then
    raise exception 'user id is required';
  end if;

  if p_email is null or btrim(p_email) = '' then
    return;
  end if;

  for v_grant in
    select *
    from public.pending_package_access_grants
    where status = 'PENDING'
      and lower(purchaser_email) = lower(p_email)
    order by created_at asc
    for update skip locked
  loop
    select *
      into v_granted
    from public.grant_package_access(
      p_user_id := p_user_id,
      p_product_id := v_grant.product_id,
      p_access_days := v_grant.access_days
    );

    update public.pending_package_access_grants
    set status = 'CLAIMED',
        claimed_by = p_user_id,
        claimed_at = now()
    where id = v_grant.id;

    grant_id := v_grant.id;
    product_id := v_grant.product_id;
    pass_id := v_granted.pass_id;
    access_start_at := v_granted.access_start_at;
    access_end_at := v_granted.access_end_at;
    return next;
  end loop;
end;
$$;
