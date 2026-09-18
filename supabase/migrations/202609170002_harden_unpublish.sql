create or replace function public.unpublish_my_profile() returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  delete from public.published_profiles where user_id = auth.uid();
end;
$$;

revoke all on function public.unpublish_my_profile() from public;
grant execute on function public.unpublish_my_profile() to authenticated;
