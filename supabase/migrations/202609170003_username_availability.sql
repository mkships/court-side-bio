create or replace function public.is_username_available(candidate text) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and candidate ~ '^[a-z0-9][a-z0-9_-]{2,23}$'
    and not public.is_reserved_username(candidate)
    and not exists (
      select 1
      from public.profile_drafts
      where username = candidate::citext
        and user_id <> auth.uid()
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to authenticated;
