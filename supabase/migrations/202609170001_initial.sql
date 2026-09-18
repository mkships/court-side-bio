create extension if not exists citext;

create table public.profile_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  constraint username_format check (username::text ~ '^[a-z0-9][a-z0-9_-]{2,23}$')
);

create table public.published_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  payload jsonb not null,
  schema_version integer not null default 1,
  published_at timestamptz not null default now(),
  constraint published_username_format check (username::text ~ '^[a-z0-9][a-z0-9_-]{2,23}$')
);

alter table public.profile_drafts enable row level security;
alter table public.published_profiles enable row level security;

create policy "owners read drafts" on public.profile_drafts for select to authenticated using (auth.uid() = user_id);
create policy "owners insert drafts" on public.profile_drafts for insert to authenticated with check (auth.uid() = user_id);
create policy "owners update drafts" on public.profile_drafts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners delete drafts" on public.profile_drafts for delete to authenticated using (auth.uid() = user_id);
create policy "published profiles are public" on public.published_profiles for select to anon, authenticated using (true);
create policy "owners manage published" on public.published_profiles for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.is_reserved_username(candidate text) returns boolean language sql immutable as $$
  select lower(candidate) = any(array['about','admin','api','dashboard','demo','help','login','onboarding','pricing','recover','settings','signup','studio','support','terms']);
$$;

create or replace function public.validate_profile_payload(p jsonb) returns void language plpgsql as $$
begin
  if coalesce(p->>'schemaVersion','') <> '1' then raise exception 'Unsupported profile schema'; end if;
  if length(trim(coalesce(p->>'name',''))) < 2 then raise exception 'Name is required'; end if;
  if not (p ? 'sports') or jsonb_array_length(p->'sports') < 1 then raise exception 'Choose a sport'; end if;
  if not (p ? 'roles') or jsonb_array_length(p->'roles') < 1 then raise exception 'Choose a role'; end if;
  if trim(coalesce(p->>'email','')) = '' and trim(coalesce(p->>'whatsapp','')) = '' then raise exception 'A contact method is required'; end if;
  if trim(coalesce(p->>'email','')) <> '' and p->>'email' !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Invalid email'; end if;
  if trim(coalesce(p->>'whatsapp','')) <> '' and p->>'whatsapp' !~ '^\+[1-9][0-9]{7,14}$' then raise exception 'Invalid WhatsApp number'; end if;
  if coalesce(p->>'username','') !~ '^[a-z0-9][a-z0-9_-]{2,23}$' or public.is_reserved_username(p->>'username') then raise exception 'Invalid or reserved username'; end if;
  if exists(select 1 from jsonb_array_elements_text(p->'sports') value where value not in ('tennis','pickleball')) then raise exception 'Invalid sport'; end if;
  if exists(select 1 from jsonb_array_elements_text(p->'roles') value where value not in ('coach','hitting_partner')) then raise exception 'Invalid role'; end if;
  if coalesce(p->>'theme','') not in ('centre','clay','night') then raise exception 'Invalid theme'; end if;
end;
$$;

create or replace function public.clean_public_profile(p jsonb) returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'schemaVersion', 1, 'username', lower(p->>'username'), 'name', p->>'name',
    'headline', coalesce(p->>'headline',''), 'bio', coalesce(p->>'bio',''),
    'sports', coalesce(p->'sports','[]'::jsonb), 'roles', coalesce(p->'roles','[]'::jsonb),
    'location', coalesce(p->>'location',''), 'photoUrl', '', 'photoKey', coalesce(p->>'photoKey',''),
    'email', coalesce(p->>'email',''), 'whatsapp', coalesce(p->>'whatsapp',''),
    'timezone', coalesce(p->>'timezone','UTC'), 'currency', coalesce(p->>'currency','USD'),
    'ratingSystem', coalesce(p->>'ratingSystem','Other'), 'ratingValue', coalesce(p->>'ratingValue',''),
    'ratingUrl', coalesce(p->>'ratingUrl',''), 'playingBackground', coalesce(p->>'playingBackground',''),
    'coachingExperience', coalesce(p->>'coachingExperience',''), 'services', coalesce(p->'services','[]'::jsonb),
    'availability', coalesce(p->'availability','[]'::jsonb), 'availabilityVisible', coalesce((p->>'availabilityVisible')::boolean,false),
    'links', coalesce(p->'links','{}'::jsonb), 'theme', coalesce(p->>'theme','centre'),
    'blockOrder', coalesce(p->'blockOrder','["credentials","services","availability","links"]'::jsonb),
    'hiddenBlocks', coalesce(p->'hiddenBlocks','[]'::jsonb)
  );
$$;

create or replace function public.save_my_draft(draft_payload jsonb) returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); uname text := lower(draft_payload->>'username');
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if uname !~ '^[a-z0-9][a-z0-9_-]{2,23}$' or public.is_reserved_username(uname) then raise exception 'Invalid or reserved username'; end if;
  if exists(select 1 from public.profile_drafts where user_id = uid and username <> uname) then raise exception 'Username cannot be changed after onboarding'; end if;
  insert into public.profile_drafts(user_id, username, payload) values(uid, uname, draft_payload || jsonb_build_object('username', uname))
  on conflict(user_id) do update set username=excluded.username, payload=excluded.payload, updated_at=now();
end;
$$;

create or replace function public.publish_my_profile(draft_payload jsonb) returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); uname text := lower(draft_payload->>'username'); clean jsonb;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  perform public.validate_profile_payload(draft_payload);
  if exists(select 1 from public.profile_drafts where user_id = uid and username <> uname) then raise exception 'Username cannot be changed after onboarding'; end if;
  clean := public.clean_public_profile(draft_payload);
  insert into public.profile_drafts(user_id,username,payload) values(uid,uname,draft_payload || jsonb_build_object('username', uname, 'photoUrl', ''))
  on conflict(user_id) do update set username=excluded.username,payload=excluded.payload,updated_at=now();
  insert into public.published_profiles(user_id,username,payload,schema_version) values(uid,uname,clean,1)
  on conflict(user_id) do update set username=excluded.username,payload=excluded.payload,schema_version=1,published_at=now();
end;
$$;

create or replace function public.unpublish_my_profile() returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.published_profiles where user_id = auth.uid();
end;
$$;

revoke all on function public.save_my_draft(jsonb) from public;
revoke all on function public.publish_my_profile(jsonb) from public;
revoke all on function public.unpublish_my_profile() from public;
grant execute on function public.save_my_draft(jsonb) to authenticated;
grant execute on function public.publish_my_profile(jsonb) to authenticated;
grant execute on function public.unpublish_my_profile() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos','profile-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "owner or published photo reads" on storage.objects for select using (
  bucket_id = 'profile-photos' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists(select 1 from public.published_profiles p where p.payload->>'photoKey' = name)
  )
);
create policy "owner uploads profile photos" on storage.objects for insert to authenticated with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner updates profile photos" on storage.objects for update to authenticated using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner deletes profile photos" on storage.objects for delete to authenticated using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
