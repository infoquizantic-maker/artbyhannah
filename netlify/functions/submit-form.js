// netlify/functions/submit-form.js
//
// Thin server-side proxy for the three public "anyone can insert" tables
// (contact_messages, custom_requests, inquiries). Added so that:
//   1. There's a real rate-limit chokepoint — without this, anyone with
//      the public anon key (visible in any browser) can script unlimited
//      inserts straight against the Supabase REST API.
//   2. The service-role key can be used for these inserts instead, so the
//      anon key's insert grant on these tables can eventually be revoked
//      entirely (optional — see supabase/migrations/003_lock_down_public_inserts.sql).
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set as Netlify site
// environment variables (Site settings → Environment variables). These are
// NOT prefixed with VITE_, so Vite will never bundle them into the client
// — they only exist in this server-side function's runtime.
//
// NOTE on rate limiting: this uses an in-memory Map, which works per
// function instance. Netlify may spin up multiple instances under load, so
// this is a best-effort deterrent, not a hard guarantee — good enough to
// stop naive scripted spam. If abuse continues despite this, upgrade to a
// shared store (Upstash Redis, Netlify Blobs) so the limit is enforced
// across all instances.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_ORIGIN = process.env.SITE_ORIGIN || 'https://www.artbyhannaah.com';
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PER_WINDOW = 5;

const hits = new Map();

const ALLOWED_TABLES = {
  contact_messages: {
    allowedFields: ['name', 'email', 'subject', 'message'],
    required: ['name', 'email', 'message'],
    defaults: { status: 'unread' },
  },
  custom_requests: {
    allowedFields: ['name', 'email', 'phone', 'size', 'style', 'budget', 'description', 'deadline'],
    required: [],
    defaults: { status: 'pending' },
  },
  inquiries: {
    allowedFields: ['name', 'email', 'phone', 'message', 'items'],
    required: [],
    defaults: { status: 'new' },
  },
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const record = hits.get(ip) || { count: 0, start: now };
  if (now - record.start > WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }
  record.count += 1;
  hits.set(ip, record);
  return record.count > MAX_PER_WINDOW;
}

function sanitizePayload(table, rawPayload) {
  const config = ALLOWED_TABLES[table];
  if (!config || typeof rawPayload !== 'object' || rawPayload === null) return null;

  const clean = {};
  for (const field of config.allowedFields) {
    if (field in rawPayload) clean[field] = rawPayload[field];
  }

  for (const field of config.required) {
    if (!clean[field] || (typeof clean[field] === 'string' && !clean[field].trim())) {
      return { error: `Missing required field: ${field}` };
    }
  }

  if (typeof clean.email === 'string' && clean.email && !EMAIL_RE.test(clean.email)) {
    return { error: 'Invalid email address' };
  }

  // Trim + cap length on every string field — mirrors the DB CHECK
  // constraints in supabase/migrations/001_security_hardening.sql, so a
  // bad request fails fast here with a clean error instead of a raw
  // Postgres constraint-violation message.
  for (const [key, value] of Object.entries(clean)) {
    if (typeof value === 'string') {
      clean[key] = value.trim().slice(0, 5000);
    }
  }
  if (Array.isArray(clean.items)) {
    clean.items = clean.items.slice(0, 20);
  }

  return { data: { ...clean, ...config.defaults } };
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const ip = req.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return json(429, { error: 'Too many requests. Please try again in a few minutes.' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { table, payload } = body || {};
  if (!table || !ALLOWED_TABLES[table]) {
    return json(400, { error: 'Invalid table' });
  }

  const sanitized = sanitizePayload(table, payload);
  if (!sanitized || sanitized.error) {
    return json(400, { error: sanitized?.error || 'Invalid payload' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[submit-form] Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars');
    return json(500, { error: 'Server misconfiguration' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await supabase.from(table).insert(sanitized.data);

  if (error) {
    console.error(`[submit-form] insert into ${table} failed:`, error);
    return json(500, { error: 'Submission failed. Please try again later.' });
  }

  return json(200, { ok: true });
};
