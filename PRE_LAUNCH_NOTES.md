# Pre-Launch Enhancements — Implementation Notes

This documents the 20 pre-launch items and exactly what was implemented, what's
a placeholder you need to replace, and what needs a manual step outside the code.

Important context: this is a **client-rendered React SPA** (Vite + a custom
router, no server-side rendering). That shapes a few of the decisions below —
see the "SPA caveats" section at the bottom.

---

## 1. Site Structure & Navigation

- **Custom 404** — `src/components/NotFound.jsx`, wired into `src/App.jsx`'s
  route matching. Branded, has quick links + a "search" box (routes to the
  gallery since there's no real search index yet). Also added a static
  `public/404.html` as a best-effort fallback (see SPA caveats).
- **Breadcrumbs** — `src/components/Breadcrumbs.jsx`. Renders visible nav +
  injects `BreadcrumbList` JSON-LD. Used on the artwork detail page, Case
  Studies, and Privacy Policy (not the homepage, per convention).
- **Internal links** — Added: About → Case Studies; Header/Footer nav → Case
  Studies; Case Studies → Custom Art form. Existing Gallery → Product page
  links were already in place.

## 2. Conversions & CTAs

- **CTA above the fold** — Already present in `Hero.jsx`; left as-is (it's
  solid: a clear headline, two CTAs, and trust stats).
- **Sticky mobile CTA** — `src/components/StickyMobileCTA.jsx`, `md:hidden`,
  fixed to viewport bottom with safe-area padding for iOS. Shows a WhatsApp
  link (`wa.me/923038907552`) and a "Commission Art" button. Hidden on
  `/admin` and `/thank-you`.
- **Thank you page** — `src/components/ThankYou.jsx` at `/thank-you`. Fires a
  `generate_lead` GA4 event on load, shows "what happens next." The Contact
  form now redirects here after a successful submit; the Custom Request modal
  links here via a "View Next Steps" button.
- **Response time promise** — Already existed near the Contact form; also
  added next to the Custom Request submit button.

## 3. Content & Trust Signals

- **Case studies** — `src/components/CaseStudies.jsx` at `/case-studies`,
  content sourced from `CASE_STUDIES` in `src/mockData.js`.
  **⚠️ This is placeholder content — replace with 3–6 real commissions**
  (real client photos, a real quote/brief, real before/after) before launch.
  It's clearly marked with a TODO comment in `mockData.js`.
- **FAQs** — `src/components/FAQ.jsx`, 5 questions, accordion UI, added to the
  homepage above Contact. Includes `FAQPage` JSON-LD.
- **Testimonials** — Already well-built (real ratings, names, Supabase-backed).
  No changes needed.
- **Team photo / About** — Already had a real photo + bio. Left as-is.

## 4. On-Page SEO & Metadata

- **Unique titles / meta descriptions** — Since there's no SSR, these are set
  client-side per route via `useDocumentHead()` in `src/lib/seo.js`, called
  from Home, ProductPage, Case Studies, Thank You, Privacy Policy, and 404.
- **OG / Twitter share image** — Tags are in `index.html`, pointing to
  `/og-image.jpg`. **⚠️ That file doesn't exist yet — you need to design and
  add a real 1200×630px image at `public/og-image.jpg`.**
- **Alt text** — Audited all `<img>` tags. Fixed empty `alt=""` on the
  ProductPage thumbnail strip; everything else already had descriptive alt
  text (artwork titles, "Studio workspace", etc.).

## 5. Technical SEO, Analytics & Local

- **robots.txt** — `public/robots.txt`, allows everything except `/admin`,
  references the sitemap.
- **sitemap.xml** — `public/sitemap.xml`, lists the static routes. Artwork
  pages (`/art/:id`) come from Supabase and aren't in it yet — see note in
  the file for how to generate them at build time.
- **LocalBusiness schema** — Injected in `index.html` `<head>` with name,
  address (Dream Garden, Multan), phone, hours.
- **Maps & directions** — Google Maps iframe embedded in the Contact section,
  plus a text note on studio-visit policy and shipping.
- **Privacy Policy** — `src/components/PrivacyPolicy.jsx` at
  `/privacy-policy`, linked in the footer.
- **GA4** — `gtag.js` snippet in `index.html` (placeholder ID
  `G-XXXXXXXXXX`) + `src/lib/analytics.js` helper. Lead events fire on
  contact form submit, custom request submit, artwork inquiry submit, and
  thank-you page load.

---

## Before you deploy — action items

1. Replace `G-XXXXXXXXXX` in `index.html` (two places) with your real GA4
   Measurement ID.
2. Design and add `public/og-image.jpg` (1200×630px).
3. Replace the placeholder domain `https://www.artbyhannaah.com` in
   `src/lib/seo.js`, `index.html`, `public/robots.txt`, and
   `public/sitemap.xml` with your real production domain.
4. Replace the 3 placeholder case studies in `src/mockData.js` with real
   projects (photos + real client details).
5. Run `npm install && npm run build` and fix any build errors — this
   environment couldn't run a live build to verify (no network access), so
   the changes were checked by hand for syntax correctness but not compiled.

## SPA caveats (read this before assuming "it's SEO-perfect")

Because this app has no server-side rendering:

- **True HTTP 404 status**: Netlify's SPA fallback (`/* → /index.html 200`)
  means every URL returns 200, even genuinely broken ones — because artwork
  pages are dynamic and Netlify can't tell a typo from a valid `/art/:id`.
  The mitigation: the in-app `NotFound` component sets
  `<meta name="robots" content="noindex">`, so Google won't index 404
  content even though the HTTP status is 200. This is the standard practical
  workaround for SPA 404s without SSR.
- **Meta tags for non-JS crawlers**: title/description/OG tags are written by
  JavaScript after the page loads. Googlebot handles this fine, but some
  bots/link-unfurlers (Slack, older crawlers) may only see the default tags
  baked into `index.html`. If that becomes a problem, look at prerendering
  (e.g. a static export per route, or a service like Prerender.io) rather
  than a full SSR rewrite.
