-- Adds the testimonials block. Keep in sync with profileSchema in src/lib/validation/profile.ts.
-- Session lengths and group clinics need no change here: services already pass through untouched.

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
  if exists(select 1 from jsonb_array_elements_text(p->'sports') value where value not in ('tennis','pickleball','padel')) then raise exception 'Invalid sport'; end if;
  if exists(select 1 from jsonb_array_elements_text(p->'roles') value where value not in ('coach','hitting_partner')) then raise exception 'Invalid role'; end if;
  if coalesce(p->>'theme','') not in ('centre','clay','hard','night') then raise exception 'Invalid theme'; end if;
  if p ? 'testimonials' and jsonb_typeof(p->'testimonials') <> 'array' then raise exception 'Invalid testimonials'; end if;
  if jsonb_array_length(coalesce(p->'testimonials','[]'::jsonb)) > 3 then raise exception 'Show up to 3 testimonials'; end if;
  if exists(
    select 1 from jsonb_array_elements(coalesce(p->'testimonials','[]'::jsonb)) item
    where jsonb_typeof(item) <> 'object'
      or length(trim(coalesce(item->>'quote',''))) not between 1 and 280
      or length(trim(coalesce(item->>'name',''))) not between 1 and 60
      or length(coalesce(item->>'context','')) > 60
  ) then raise exception 'Invalid testimonial'; end if;
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
    'links', coalesce(p->'links','{}'::jsonb), 'testimonials', coalesce(p->'testimonials','[]'::jsonb),
    'theme', coalesce(p->>'theme','centre'),
    'blockOrder', coalesce(p->'blockOrder','["credentials","services","testimonials","availability","links"]'::jsonb),
    'hiddenBlocks', coalesce(p->'hiddenBlocks','[]'::jsonb)
  );
$$;
