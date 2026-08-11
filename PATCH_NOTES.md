# Patch Notes — Security Hardening Pass

This documents every change made against `SECURITY_AUDIT.md`, split into
**applied in code** (already in this zip) and **manual — you said you'll do
these** (dashboard toggles only you can do, since they require your Supabase
project/Netlify site credentials).

---

## ✅ Applied in code

### 1. Database — `supabase/migrations/`
Three new SQL files, meant to be run in order in **Supabase Dashboard → SQL
Editor** (they're additive — your existing `schema.sql` doesn't need to
change):

- **`001_security_hardening.sql`** — run this now. Adds `CHECK` constraints
  (email format, length caps) to `contact_messages`, `custom_requests`, and
  `inquiries` so garbage/oversized data can't land in the DB even via a
  direct API call.
- **`002_require_mfa_for_admin.sql`** — **do NOT run yet.** Only run this
  after you've enrolled TOTP MFA on the admin account (see manual steps
  below) and confirmed you can still log in. It changes `is_admin()` to
  require a completed second factor, which will lock out all admin writes
  until MFA is set up.
- **`003_lock_down_public_inserts_OPTIONAL.sql`** — optional, run later.
  Once `netlify/functions/submit-form.js` (below) is live in production and
  you've confirmed all three forms submit through it successfully, this
  revokes the anon key's direct insert grant on the three public tables,
  forcing all submissions through the rate-limited function.

### 2. Rate limiting — `netlify/functions/submit-form.js`
New serverless function that the three public forms now call instead of
inserting into Supabase directly from the browser. It rate-limits by IP (5
submissions / 10 minutes), re-validates and trims every field server-side,
and uses the service-role key (server-side only — never shipped to the
browser). `netlify.toml` was updated with a `[functions]` block so Netlify
bundles it correctly with its `@supabase/supabase-js` import.

**You need to set these in Netlify (Site settings → Environment variables →
scope: Functions or All):**
```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase Dashboard → Settings → API>
SITE_ORIGIN=https://www.artbyhannaah.com
```
Do **not** prefix these with `VITE_` — that prefix tells Vite to bundle the
value into client-side JS, which would ship your service-role key to every
visitor. `.env.example` now documents this distinction.

### 3. Input validation — `src/lib/validation.js`
New Zod schemas (`contactSchema`, `customRequestSchema`, `inquirySchema`)
plus a `submitForm()` helper that posts to the new function. Wired into:
- `src/components/Contact.jsx`
- `src/components/CustomRequest.jsx`
- `src/components/ProductPage.jsx` (the artwork inquiry form)

All three now validate client-side with Zod (fast, friendly errors) *and*
go through the server-side function (real enforcement) *and* hit the DB
`CHECK` constraints (last line of defense) — three layers, only the DB one
is unbypassable, which is intentional.

Added `zod` to `package.json` dependencies (v4). Run `npm install` after
pulling this down.

### 4. Form field length limits
Added `maxLength` attributes matching the Zod/DB limits to every text input
across `Contact.jsx`, `CustomRequest.jsx`, and `ProductPage.jsx` (120 chars
for names, 200 for emails/subjects, 30 for phone, 5000 for messages).

### 5. Security headers — `public/_headers`
New file, read automatically by Netlify. Sets a Content-Security-Policy
(with a SHA-256 hash allowlisting the one inline GA4 init script, so no
`unsafe-inline` was needed for scripts), `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, a strict `Referrer-Policy`, and a locked
down `Permissions-Policy`. This is the main mitigation for the fact that
`supabase-js` stores the session token in `localStorage` (see
`SECURITY_AUDIT.md` §5.3) — a strong CSP makes the XSS that would be needed
to steal it much harder to pull off in the first place.

**If you change your GA4 setup or add other inline `<script>` tags to
`index.html` later, you'll need to recompute the hash** (or move the script
to an external file) — a mismatched hash will silently block the script
under this CSP. Happy to redo that anytime you change `index.html`.

### 6. File upload validation — `src/components/Admin.jsx`
`handleFilesPicked` now rejects (with a toast) any file that isn't
JPEG/PNG/WEBP/GIF or exceeds 10MB, before it's ever uploaded. This is a
client-side check for a fast, friendly error — the actual enforcement still
needs the Storage bucket setting (see manual steps below), since this
check alone doesn't stop a direct API call.

### 7. Error message hardening — `src/components/Admin.jsx` + `ProductPage.jsx`
Every place that showed a raw Supabase/Postgres `error.message` (or
special-cased the `42501` RLS error code) directly to a toast or on-page
error now shows a generic, friendly message instead, with the real error
still logged via `console.error` for your own debugging. Covers: artwork
load/save/delete, testimonial load/save/delete, the generic inbox tabs
(messages/requests/inquiries) load/update/delete, and the public artwork
detail page load. (Left the login form's error message as-is — that's a
standard "Invalid login credentials" from Supabase Auth, not an internal
leak.)

### 8. Secret scanning — `.gitleaks.toml`
Config file for [gitleaks](https://github.com/gitleaks/gitleaks), extending
its default secret-detection rules with an allowlist for the two values
that are *meant* to be public in this app (the Supabase anon key and
EmailJS public key — see `SECURITY_AUDIT.md` §1.2).

**One-time setup once you have this in a git repo:**
```bash
brew install gitleaks   # or see github.com/gitleaks/gitleaks for other installs
gitleaks detect --source . --verbose   # run once now to confirm clean
```
Then add a pre-commit hook so it runs automatically:
```bash
# .git/hooks/pre-commit (make it executable: chmod +x .git/hooks/pre-commit)
#!/bin/sh
gitleaks protect --staged --redact
```

---

## 🔧 Manual — you said you'll handle these

All of these are Supabase/Netlify dashboard settings, not code, so they're
outside what I can patch in the repo itself.

1. **Enable TOTP MFA on the admin account** — Supabase Dashboard →
   Authentication → MFA (or enroll from within the app via
   `supabase.auth.mfa.enroll()`). Do this *before* running
   `002_require_mfa_for_admin.sql`.
2. **Disable public sign-ups** — Authentication → Settings → "Allow new
   users to sign up" → Off.
3. **Raise the password policy** — Authentication → Policies → Password
   Requirements → minimum length 12+, require mixed case/digit/symbol, and
   enable leaked-password protection.
4. **Set Storage bucket MIME/size limits** — Storage → `artworks` bucket →
   Edit bucket → allowed MIME types `image/jpeg, image/png, image/webp,
   image/gif`, file size limit ~10MB. (This is the server-side enforcement
   that backs up the client-side check added in `Admin.jsx`.)
5. **Set the three Netlify environment variables** for the new function —
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_ORIGIN` (see section 2
   above for exact values and where they come from).
6. **Run the SQL migrations** in order — `001` now, `002` only after MFA is
   confirmed working, `003` only after the Netlify Function is live and
   verified.
7. Optional, ongoing: install `gitleaks` and wire up the pre-commit hook
   (section 8 above) whenever you push this to a real git repo.

---

## After pulling this down

```bash
npm install        # picks up the new zod dependency
npm run build       # sanity-check the build still succeeds
netlify dev          # if you want to test the new function locally before deploying
```
Then deploy as usual — Netlify will pick up `public/_headers` and
`netlify/functions/submit-form.js` automatically on the next deploy once the
three env vars from step 5 above are set.
