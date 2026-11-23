begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_id bigint not null unique check (github_id > 0),
  handle text not null check (handle ~ '^[A-Za-z0-9-]{1,39}$'),
  display_name text check (char_length(display_name) <= 100),
  bio text check (char_length(bio) <= 500),
  avatar_url text,
  created_at timestamptz not null default now()
);
create unique index profiles_handle_unique on public.profiles (lower(handle));

create table public.categories (
  slug text primary key,
  label text not null unique
);
insert into public.categories values
  ('developer-tools', 'Developer tools'),
  ('productivity', 'Productivity'),
  ('data', 'Data & visualization');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  github_repo_id bigint not null check (github_repo_id > 0),
  github_full_name text not null,
  github_stars integer not null default 0 check (github_stars >= 0),
  github_synced_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 2000),
  technologies text[] not null default '{}' check (cardinality(technologies) <= 12),
  category_slug text not null references public.categories(slug),
  demo_url text not null check (demo_url ~ '^https://[^[:space:]]+$' and char_length(demo_url) <= 2048),
  thumbnail_url text check (thumbnail_url ~ '^https://[^[:space:]]+$' and char_length(thumbnail_url) <= 2048),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  search_document tsvector not null,
  unique (owner_id, github_repo_id)
);

create function public.update_project_search() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.search_document :=
    setweight(to_tsvector('simple', new.title), 'A') ||
    setweight(to_tsvector('simple', array_to_string(new.technologies, ' ')), 'B') ||
    setweight(to_tsvector('simple', new.description), 'C');
  return new;
end;
$$;

create trigger update_project_search
before insert or update on public.projects
for each row execute function public.update_project_search();

create index projects_search_idx on public.projects using gin(search_document)
  where published_at is not null;
create index projects_gallery_idx on public.projects(published_at desc, id)
  where published_at is not null;
create index projects_category_idx on public.projects(category_slug, published_at desc, id)
  where published_at is not null;

create table public.demo_launches (
  event_id uuid primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  launch_mode text not null check (launch_mode in ('embedded', 'external')),
  occurred_at timestamptz not null default now()
);
create index demo_launches_project_time_idx on public.demo_launches(project_id, occurred_at desc);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.demo_launches enable row level security;

revoke all on public.profiles, public.categories, public.projects, public.demo_launches from anon, authenticated;
grant select on public.profiles, public.categories, public.projects to anon, authenticated;
grant update (display_name, bio) on public.profiles to authenticated;
grant delete on public.projects to authenticated;
grant update (title, description, technologies, category_slug, demo_url, thumbnail_url, published_at)
  on public.projects to authenticated;
grant select on public.demo_launches to authenticated;
grant select, insert, update on public.profiles, public.projects to service_role;
grant insert on public.demo_launches to service_role;

create policy profiles_public_read on public.profiles for select using (true);
create policy profiles_owner_edit on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy categories_public_read on public.categories for select using (true);
create policy projects_public_read on public.projects for select
  using (published_at is not null and published_at <= now());
create policy projects_owner_read on public.projects for select to authenticated
  using ((select auth.uid()) = owner_id);
create policy projects_owner_edit on public.projects for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy projects_owner_delete on public.projects for delete to authenticated
  using ((select auth.uid()) = owner_id);
create policy launches_owner_read on public.demo_launches for select to authenticated
  using (exists (
    select 1 from public.projects
    where projects.id = demo_launches.project_id and projects.owner_id = (select auth.uid())
  ));

commit;
