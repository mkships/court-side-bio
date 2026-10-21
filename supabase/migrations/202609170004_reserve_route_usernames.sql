-- Keep in sync with reservedUsernames in src/lib/validation/profile.ts and the top-level routes in src/app.
create or replace function public.is_reserved_username(candidate text) returns boolean
language sql
immutable
as $$
  select lower(candidate) = any(array[
    'about','admin','api','auth','dashboard','demo','help','login','onboarding','pricing',
    'recover','settings','signup','studio','support','terms','update-password'
  ]);
$$;
