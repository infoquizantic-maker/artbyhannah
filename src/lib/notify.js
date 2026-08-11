// Sends an email notification via EmailJS's REST API using plain fetch —
// no extra npm package required.
//
// To enable emails: create a free account at https://www.emailjs.com,
// add an Email Service + Email Template, then set these in your .env
// (and in Netlify's Environment Variables):
//
//   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
//   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
//
// Every form on the site already saves to Supabase (visible in /admin)
// regardless of whether email is configured — email is a "nice to have"
// notification on top of that, so nothing breaks if it's not set up yet.

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = () => Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

/**
 * Fire-and-forget email notification. Never throws — logs a warning
 * instead so a missing/broken email setup never blocks a form submission
 * (the Supabase save, which powers the Admin panel, always happens first).
 *
 * @param {Object} params - key/value pairs available to your EmailJS template
 */
export async function sendNotificationEmail(params) {
  if (!isEmailConfigured()) {
    console.warn('[notify] EmailJS is not configured — skipping email notification. See src/lib/notify.js');
    return { skipped: true };
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: params,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('[notify] EmailJS send failed:', res.status, text);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.warn('[notify] EmailJS send error:', err);
    return { ok: false };
  }
}
