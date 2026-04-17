create table if not exists public.lead_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.products(id) on delete cascade,
  row_no integer not null check (row_no > 0),
  country text not null,
  company_name text not null,
  website_url text,
  phone text,
  email text,
  facebook text,
  instagram text,
  linkedin text,
  other_social text,
  website_present boolean not null default false,
  phone_present boolean not null default false,
  email_present boolean not null default false,
  has_any_contact_channel boolean not null default false,
  sellable_status text not null default 'sellable',
  review_reason text,
  product_grade text not null default 'basic'
    check (product_grade in ('basic', 'verified', 'contact_enriched')),
  duplicate_group_id text,
  duplicate_group_size integer not null default 1
    check (duplicate_group_size > 0),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  unique (package_id, row_no)
);

create index if not exists lead_package_items_package_id_idx
  on public.lead_package_items(package_id);

create index if not exists lead_package_items_package_id_row_no_idx
  on public.lead_package_items(package_id, row_no);

create index if not exists lead_package_items_product_grade_idx
  on public.lead_package_items(product_grade);

create index if not exists lead_package_items_sellable_status_idx
  on public.lead_package_items(sellable_status);

alter table public.lead_package_items enable row level security;

comment on table public.lead_package_items is
  'Stores package-scoped lead rows for the external viewer app. products.id acts as the package master.';

comment on column public.lead_package_items.package_id is
  'Foreign key to public.products.id. In the viewer model, each product is treated as a sellable data package.';

comment on column public.lead_package_items.row_no is
  'Stable 1-based row number shown to the customer in the viewer and used for pagination.';

comment on column public.lead_package_items.raw_payload is
  'Original normalized CSV payload kept for audit and reprocessing.';
