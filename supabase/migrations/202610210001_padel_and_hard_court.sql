-- Adds padel as a sport and the hard-court theme. Keep in sync with profileSchema in src/lib/validation/profile.ts.
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
end;
$$;
