import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This is the #1 cause of a site that hangs forever on "Loading...":
  // the VITE_SUPABASE_* env vars were not available at build time.
  // On Netlify these must be added under Site settings -> Environment variables
  // (a .env file in your repo is NOT enough — Netlify's build servers don't
  // read it unless it was committed, and even then it's safer to set them
  // in the dashboard). See SUPABASE_SETUP_GUIDE.md for the full checklist.
  console.error(
    "[supabase] Missing Supabase config values. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set (both locally in .env and in your Netlify site's Environment Variables)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket that holds artwork photos (public read, admin-only write —
// see supabase/storage-policies.sql).
export const ARTWORK_BUCKET = "artworks";

// Keep in sync with the admin allow-list in src/components/Admin.jsx and in
// the is_admin() function in supabase/schema.sql.
export const ADMIN_EMAILS = ["artbyhannah29@gmail.com"];
