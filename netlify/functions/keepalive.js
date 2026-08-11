// netlify/functions/keepalive.js
//
// Supabase free-tier projects auto-pause after 7 days with no API activity.
// This is a Netlify Scheduled Function (see `config.schedule` below) that
// runs automatically on Netlify's own clock — no external cron service, no
// uptime-monitor pinging your site needed. It just does one trivial
// read-only query against Supabase so the project always sees activity
// well inside the 7-day window.
//
// Uses the same SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars already
// set for submit-form.js — nothing new to configure. Reuses the
// service-role key (rather than the anon key) so this keeps working even
// after Part 6 (revoking the anon key's grants) or any future RLS changes;
// this function only ever performs a single harmless SELECT, never a write.
//
// Schedule is "@weekly" (once every 7 days) — comfortably inside Supabase's
// 7-day pause window. If you ever want to see it run without waiting a
// week, you can trigger it manually: Netlify dashboard → Functions →
// keepalive → "Trigger function".

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[keepalive] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars');
    return new Response('Missing env vars', { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Cheapest possible read: count rows, fetch none of the data.
  const { error, count } = await supabase
    .from('artworks')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('[keepalive] ping failed:', error);
    return new Response('Ping failed', { status: 500 });
  }

  console.log(`[keepalive] ok — artworks count: ${count}`);
  return new Response('ok', { status: 200 });
};

export const config = {
  schedule: '@weekly',
};
