create table if not exists public.cafe24_mall_integrations (
  id uuid primary key default gen_random_uuid(),
  mall_id text not null unique,
  shop_no integer,
  user_id text,
  token_type text,
  scopes jsonb not null default '[]'::jsonb,
  access_token text not null,
  refresh_token text not null,
  issued_at timestamptz,
  expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  last_error text,
  raw_response jsonb,
  installed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cafe24_mall_integrations_installed_by_idx
  on public.cafe24_mall_integrations(installed_by);

alter table public.cafe24_mall_integrations enable row level security;

drop trigger if exists cafe24_mall_integrations_set_updated_at on public.cafe24_mall_integrations;
create trigger cafe24_mall_integrations_set_updated_at
before update on public.cafe24_mall_integrations
for each row
execute function public.set_updated_at();

comment on table public.cafe24_mall_integrations is
  'Stores OAuth tokens and metadata for Cafe24 mall integrations used by order sync and viewer access flows.';

comment on column public.cafe24_mall_integrations.scopes is
  'Array of OAuth scopes approved for this mall installation.';

comment on column public.cafe24_mall_integrations.raw_response is
  'Original OAuth token response from Cafe24 for audit and debugging.';
