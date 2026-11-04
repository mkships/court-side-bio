# courtsidebio

courtsidebio is a focused digital-identity SaaS for tennis, pickleball and padel coaches and hitting partners. Creators publish a themed, modular profile with services, recurring availability and direct email/WhatsApp inquiry links. It is intentionally not a marketplace or booking system.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. With blank Supabase variables, `/studio` runs in clearly labelled browser-local demo mode. Drafts and published snapshots persist in that browser only. The fictional, development-only fixture is at `src/lib/fixtures.ts` and renders at `/demo`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Supabase setup

This project uses email/password authentication, private profile-photo storage, owner-only drafts and a deliberately public published snapshot table.

1. Create a free Supabase project.
2. Open **SQL Editor** and run the files in `supabase/migrations/` in filename order. Existing projects must apply every newer migration they have not run, including `202609170002_harden_unpublish.sql`, `202609170003_username_availability.sql`, `202609170004_reserve_route_usernames.sql` and `202610210001_padel_and_hard_court.sql`.
3. In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback**` as an allowed redirect URL. The wildcard permits the safe `next` query used for signup and password recovery.
4. Copy the Project URL and public anon key from **Project Settings → API** into `.env.local`:

   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
   ```

5. Restart `npm run dev`, create an account at `/signup`, confirm the email if confirmation is enabled, and continue in `/studio`.

Never put the Supabase service-role key in this project or in a `NEXT_PUBLIC_` variable. The application does not need it.

The SQL migration creates:

- `profile_drafts`, readable and writable only by its owning authenticated user;
- `published_profiles`, publicly readable and owner-managed;
- atomic `save_my_draft`, `publish_my_profile` and `unpublish_my_profile` functions;
- a private `profile-photos` bucket with MIME, size and ownership policies.

Published profile reads are uncached initially so unpublishing takes effect immediately. Profile images use stable private object keys; a short-lived signed URL is created only after the profile is found in the published table.

## Test with two creators

1. Create account A, claim a username, complete onboarding and publish.
2. Open a private/incognito window and confirm `/<username>` works without signing in.
3. Edit account A without updating the page and confirm the anonymous window still shows the old snapshot.
4. Create account B with a different email. Try account A's username; the database must reject it case-insensitively.
5. Confirm account B cannot select or update account A's row in `profile_drafts` through the Supabase client.
6. Unpublish account A and refresh the anonymous URL; it should display the generic unavailable state.

## Deploy to Vercel

1. Import the repository into Vercel.
2. Add the three environment variables from `.env.example` with the production site URL.
3. Add `https://YOUR_DOMAIN/auth/callback` to Supabase Authentication redirect URLs and set the production Site URL.
4. Deploy using the standard Next.js build command (`npm run build`).
5. Exercise signup, photo upload, publish, anonymous view, draft isolation and unpublish before launch.

No deployment is performed automatically by this repository.

## MVP boundaries and current tradeoffs

- Availability consists of recurring 60-minute local-time windows. The visitor sees occurrences in the next seven local calendar days. A nonexistent local time during the spring DST transition is skipped; an ambiguous fall-transition time uses its earlier occurrence. Every selection remains an inquiry that the creator confirms manually.
- There is no calendar sync, slot consumption, inbox, payment, analytics, discovery or visitor account.
- Browser-local mode is for development demonstration only and cannot produce a cross-device public link.
- The production database revalidates identity, username and contact prerequisites. Zod performs the fuller application validation before publish.
