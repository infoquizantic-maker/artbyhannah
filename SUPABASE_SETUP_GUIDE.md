# Supabase Setup Guide — ART by Hannaah

This site now uses **Supabase** instead of Firebase for the database,
authentication, and file storage. Follow these steps in order — the whole
thing takes about 15–20 minutes and stays on Supabase's free plan.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up / sign in → **New project**.
2. Pick an organization, name the project (e.g. `art-by-hannah`), set a
   database password (save it somewhere — you likely won't need it day-to-day,
   but it's needed for direct Postgres connections), and choose a region
   close to your customers (e.g. an Asia-Pacific region for Pakistan).
3. Click **Create new project** and wait ~1–2 minutes for it to provision.

## 2. Run the database schema

1. In the left sidebar, open **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy its entire contents,
   paste into the editor, and click **Run**.
3. This creates the `artworks`, `testimonials`, `contact_messages`,
   `custom_requests`, and `inquiries` tables, turns on Row Level Security,
   and adds the policies that mirror your old Firestore rules:
   - `artworks` / `testimonials` — anyone can read, only the admin can write.
   - `contact_messages` / `custom_requests` / `inquiries` — anyone can
     submit (insert), only the admin can read, update status, or delete.
4. **If you want more than one admin login**, edit the array inside the
   `is_admin()` function near the top of the script before running it:
   ```sql
   select coalesce(auth.jwt() ->> 'email', '') = any (array['artbyhannah29@gmail.com', 'second-admin@gmail.com']);
   ```
   You can also re-run just that `create or replace function` block later
   from the SQL Editor to add more admins without touching anything else.

## 3. Create the Storage bucket for product photos

1. Left sidebar → **Storage** → **New bucket**.
2. Name it exactly `artworks` (this must match `ARTWORK_BUCKET` in
   `src/supabaseClient.js`).
3. Toggle **Public bucket** → **ON** (photos need to be publicly viewable on
   the gallery — writes are still locked down by policy, this only affects
   reads).
4. Under **Additional configuration** (or via bucket settings after
   creating it), it's worth setting:
   - **File size limit**: `15 MB` (matches the old Firebase Storage rule)
   - **Allowed MIME types**: `image/*`
5. Back in **SQL Editor → New query**, paste in the contents of
   `supabase/storage-policies.sql` and click **Run**. This restricts
   uploads/overwrites/deletes to the admin email while keeping reads public.

## 4. Create your admin login (email + password)

No Google Cloud Console needed — email/password is on by default in
Supabase.

1. Left sidebar → **Authentication → Users → Add user → Create new user**.
2. Enter the admin email (must match an entry in `ADMIN_EMAILS` in
   `src/supabaseClient.js` — currently `artbyhannah29@gmail.com`) and set a
   password.
3. Toggle **Auto Confirm User** to ON when creating them (or open the user
   afterward and confirm their email manually) — otherwise Supabase expects
   them to click a confirmation email before they can sign in, which you
   don't need for a single trusted admin account.
4. That's it. Go to `/admin` on your site and sign in with that email and
   password.

Want more than one person to manage the site? Repeat this step for each
person's email, and add every one of those emails to **both**
`ADMIN_EMAILS` in `src/supabaseClient.js` **and** the `is_admin()` function
in `supabase/schema.sql` (re-run just that `create or replace function`
block in the SQL Editor).

> To change a password later: **Authentication → Users** → click the user →
> **Reset password** (or send them a reset-password email from there).

## 5. Get your API keys

1. Left sidebar → **Settings → API**.
2. Copy the **Project URL** and the **`anon` `public`** key (NOT the
   `service_role` key — that one is secret and only used server-side, e.g.
   in `seed.js`).

## 6. Set environment variables

**Locally**, edit `.env` in the project root:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**On Netlify**: Site settings → Environment variables → add the same two
keys, then trigger a new deploy (env var changes don't apply to
already-built deploys).

## 7. Install dependencies and run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173/admin`, sign in with your admin Google
account, and try adding an artwork with a couple of photos to confirm
Storage uploads are working.

## 8. (Optional) Seed some sample content

If you want a few placeholder artworks/testimonials to start with instead of
adding everything by hand:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node seed.js
```

Get the `service_role` key from the same **Settings → API** page as step 5
— keep it secret, it bypasses Row Level Security. Never put it in `.env` or
in front-end code; it's only for this one-off script run from your machine.

---

## Troubleshooting

- **Gallery/Testimonials stuck loading or empty** — almost always Row Level
  Security. Re-check that `supabase/schema.sql` ran without errors, and
  that the `artworks_public_read` / `testimonials_public_read` policies
  exist (Database → Policies in the dashboard).
- **Can't sign in to `/admin`** — check the email/password are correct, and
  that the user has **Auto Confirm User** set (or their email confirmed) —
  step 4.3. An unconfirmed user can't sign in even with the right password.
- **"Not Authorized" after signing in** — your Google account's email isn't
  in the `is_admin()` allow-list (step 2.4) or in `ADMIN_EMAILS` in
  `src/supabaseClient.js`. Both need to match.
- **Photo upload fails** — confirm the `artworks` bucket exists, is public,
  and that `supabase/storage-policies.sql` ran successfully.
