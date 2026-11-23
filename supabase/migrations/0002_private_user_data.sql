begin;

drop policy profiles_public_read on public.profiles;
drop policy projects_public_read on public.projects;

revoke select on public.profiles, public.projects from anon;

create policy profiles_owner_read on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

commit;
