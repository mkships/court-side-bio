-- Profile rows may only be written through save_my_draft, publish_my_profile and unpublish_my_profile.
-- Those security definer functions run as the table owner, so they are unaffected by these revocations.
drop policy if exists "owners insert drafts" on public.profile_drafts;
drop policy if exists "owners update drafts" on public.profile_drafts;
drop policy if exists "owners manage published" on public.published_profiles;

revoke insert, update on public.profile_drafts from anon, authenticated;
revoke insert, update, delete on public.published_profiles from anon, authenticated;

-- Backstop for any future write path. NOT VALID skips existing rows so the migration cannot fail on legacy data.
alter table public.profile_drafts
  add constraint draft_username_not_reserved check (not public.is_reserved_username(username::text)) not valid;
alter table public.published_profiles
  add constraint published_username_not_reserved check (not public.is_reserved_username(username::text)) not valid;
