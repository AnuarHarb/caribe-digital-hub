-- Admins manage memberships from /admin/membresias

create policy "Admins select memberships"
  on public.memberships for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins insert memberships"
  on public.memberships for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update memberships"
  on public.memberships for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
