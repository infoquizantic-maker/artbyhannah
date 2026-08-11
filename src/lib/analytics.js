// Thin wrapper around gtag.js (loaded in index.html). Safe to call even if
// analytics is blocked/ad-blocked — every call is guarded.

/**
 * Fire a GA4 event. See index.html for the gtag.js snippet (placeholder
 * measurement ID: G-XXXXXXXXXX — replace with your real one before launch).
 * @param {string} eventName - e.g. "generate_lead", "form_submit"
 * @param {Object} [params] - e.g. { form_name: "contact" }
 */
export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (err) {
    // Never let analytics break the app
    console.warn('analytics: trackEvent failed', err);
  }
}

/** Convenience helper for the three lead forms on this site. */
export function trackLead(formName, extra = {}) {
  trackEvent('generate_lead', { form_name: formName, ...extra });
}

/** Track a virtual pageview for client-side route changes (gtag.js only
 * auto-tracks the first load; SPA route changes need to be sent manually). */
export function trackPageview(path, title) {
  trackEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}
