# ART By Hannaah — Website

A React + Vite + Supabase site for a custom-art commission business. Public
gallery, product pages, custom-commission requests, contact form, and an
admin panel at `/admin` — no e-commerce/checkout anywhere, by design. Every
form (contact, custom request, "request this piece") saves straight to
Supabase (Postgres) so it shows up in the Admin panel, and optionally also
emails you via EmailJS.

> **Setup:** see `SUPABASE_SETUP_GUIDE.md` for step-by-step instructions on
> creating the Supabase project, running the schema, setting up the Storage
> bucket, enabling Google sign-in, and configuring env vars locally and on
> Netlify. This file covers everything else about the codebase.

## Notable features

1. **No infinite "Loading..." states.** Gallery/Testimonials/Admin show a
   real error message instead of spinning forever if Supabase can't be
   reached (e.g. because of Row Level Security policies — see the setup
   guide).

2. **`/admin` works on Netlify.** This site has no traditional pages — it's
   a single-page app that reads `window.location.pathname` to decide what to
   render. `netlify.toml` + `public/_redirects` redirect every path to
   `index.html` (status 200) so the app's own router can take over.

3. **Fonts.** Headings site-wide use **Playfair Display** (an elegant serif
   built for exactly this kind of art/gallery branding); body text uses
   **Jost**, a clean geometric sans-serif. See `src/index.css`.

4. **"Sketch" is its own artwork category**, alongside Canvas Painting,
   Abstract Art, and Watercolor Sketch (`src/mockData.js`).

5. **Admin image uploads.** The artwork form doesn't ask for an image URL —
   you upload photos straight from your computer (multiple at once),
   Supabase Storage hosts them, and you pick which one is the cover photo
   with a ★ button. See `SUPABASE_SETUP_GUIDE.md` for the one-time bucket
   setup.

6. **Currency is PKR** everywhere (gallery, product pages, admin,
   custom-commission budget ranges) via `src/lib/currency.js`.

7. **Product pages.** Clicking any artwork opens a full page at `/art/<id>`
   — bigger photos (with a thumbnail strip if there are several), full
   description, category, price, and a "Request This Piece" form. There is
   intentionally **no buy/checkout/payment button anywhere on the site.**
   Every request — for an existing piece or a custom commission — is saved
   to Supabase and shown in `/admin`, and optionally emailed to you (see
   EmailJS below).

8. **No shopping cart or customer login**, since there's no checkout to
   protect. The Google sign-in on `/admin` is separate — that's just how
   *you* log in to manage the site.

---

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` for the site, `http://localhost:5173/admin`
for the admin panel. You'll need a Supabase project and a filled-in `.env`
first — see `SUPABASE_SETUP_GUIDE.md`.

---

## Email notifications (optional but recommended)

Every form already saves to Supabase and shows up in `/admin` — that part
works with zero extra setup. To *also* get an email the moment someone
submits a custom request, an inquiry about a piece, or a contact message:

1. Create a free account at [emailjs.com](https://www.emailjs.com) (200
   emails/month free).
2. Add an **Email Service** (e.g. connect your Gmail).
3. Add an **Email Template** — the site sends these fields you can use in
   your template: `form_type`, `name`, `email`, `phone`, `message`, and
   (depending on the form) `artwork_title`, `artwork_price`, `size`,
   `style`, `budget`, `deadline`, `subject`.
4. Copy your Service ID, Template ID, and Public Key into `.env` **and**
   into Netlify's Environment Variables:

   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
   ```

5. Redeploy. If these aren't set, forms simply skip the email step (you'll
   see a console warning) and still save fine to Supabase/`/admin`.

---

## Managing artworks & reviews

Go to `/admin` and sign in with the email/password you created for the
admin user in Supabase (**Authentication → Users**). That email must also
be listed in `ADMIN_EMAILS` inside `src/supabaseClient.js` (currently
`artbyhannah29@gmail.com`) — add more emails to that array **and** to the
`is_admin()` function in `supabase/schema.sql` (re-run that function's
`CREATE OR REPLACE` in the SQL Editor) if more than one person should
manage the site.

- **Artworks tab** — add/edit/delete pieces, upload photos from your
  computer, choose a cover photo, set category (including "Sketch"), price
  in PKR, and description.
- **Testimonials tab** — add/edit/delete reviews shown on the site.
- **Messages / Custom Requests / Inquiries tabs** — read every form
  submission from the public site, change its status, or delete it.

## Project structure

```
src/
  components/         # UI sections + Admin.jsx + ProductPage.jsx
  lib/
    router.jsx        # tiny dependency-free client-side router
    currency.js        # PKR formatting helper
    notify.js           # EmailJS notification helper (fetch-based, no SDK needed)
  supabaseClient.js     # Supabase client init + admin email allow-list
  mockData.js            # category list + custom-commission form options
supabase/
  schema.sql          # tables, RLS policies, is_admin() — run once in SQL Editor
  storage-policies.sql  # Storage bucket RLS — run after creating the bucket
seed.js               # optional: bulk-insert sample artworks/testimonials
netlify.toml           # build settings + SPA fallback redirect
public/_redirects       # SPA fallback redirect (belt-and-suspenders)
SUPABASE_SETUP_GUIDE.md  # full walkthrough: project, schema, storage, auth, env vars
```
