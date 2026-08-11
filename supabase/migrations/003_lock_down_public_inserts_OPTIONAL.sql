-- ART by Hannaah — OPTIONAL follow-up migration
--
-- Once netlify/functions/submit-form.js is deployed and you've confirmed
-- all three forms (Contact, Custom Request, and artwork Inquiry) submit
-- successfully through it, you can optionally revoke the anon key's direct
-- insert access to these tables entirely — forcing ALL public submissions
-- through the rate-limited, validated Netlify Function instead of the
-- Supabase REST API directly.
--
-- ⚠️ Do NOT run this until the Netlify Function is live in production and
-- every form has been switched over to call it (see PATCH_NOTES.md) — this
-- will otherwise break form submissions immediately.

drop policy if exists "contact_public_insert" on public.contact_messages;
drop policy if exists "custom_public_insert" on public.custom_requests;
drop policy if exists "inquiries_public_insert" on public.inquiries;

-- No replacement insert policy is created — inserts now only happen via
-- the Netlify Function, which uses the service-role key and therefore
-- bypasses RLS entirely (by design, for a trusted server-side caller).
