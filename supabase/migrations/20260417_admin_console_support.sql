create extension if not exists pgcrypto;

alter table public.profiles
add column if not exists is_admin boolean not null default false;

alter table public.products
add column if not exists status text not null default 'DRAFT'
check (status in ('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED'));

update public.products
set status = case
  when is_active = true then 'PUBLISHED'
  else 'DRAFT'
end
where status = 'DRAFT';

create table if not exists public.product_upload_jobs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'PARTIAL')),
  mode text not null default 'REPLACE'
    check (mode in ('REPLACE', 'APPEND')),
  total_rows integer not null default 0,
  success_rows integer not null default 0,
  failed_rows integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists product_upload_jobs_product_id_idx
  on public.product_upload_jobs(product_id);

create index if not exists product_upload_jobs_uploaded_by_idx
  on public.product_upload_jobs(uploaded_by);

create index if not exists product_upload_jobs_status_idx
  on public.product_upload_jobs(status);

create table if not exists public.product_upload_job_rows (
  id uuid primary key default gen_random_uuid(),
  upload_job_id uuid not null references public.product_upload_jobs(id) on delete cascade,
  row_number integer not null,
  raw_data jsonb,
  status text not null
    check (status in ('SUCCEEDED', 'FAILED')),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists product_upload_job_rows_upload_job_id_idx
  on public.product_upload_job_rows(upload_job_id);

create table if not exists public.product_publish_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  changed_by uuid not null references auth.users(id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists product_publish_logs_product_id_idx
  on public.product_publish_logs(product_id);

create index if not exists product_publish_logs_changed_by_idx
  on public.product_publish_logs(changed_by);

alter table public.product_upload_jobs enable row level security;
alter table public.product_upload_job_rows enable row level security;
alter table public.product_publish_logs enable row level security;

comment on column public.profiles.is_admin is
  'Marks a profile as an administrator who can access the admin console.';

comment on column public.products.status is
  'Operational state for admin workflow: DRAFT, READY, PUBLISHED, ARCHIVED.';

comment on table public.product_upload_jobs is
  'Stores product CSV upload attempts and aggregate results.';

comment on table public.product_upload_job_rows is
  'Stores row-level validation failures or per-row processing results for upload jobs.';

comment on table public.product_publish_logs is
  'Tracks publish/archive state changes for products from the admin console.';
