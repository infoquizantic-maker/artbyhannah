import { useEffect } from 'react';

const SITE_NAME = 'ART By Hannaah';
const SITE_URL = 'https://www.artbyhannaah.com'; // TODO: replace with the real production domain
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

/**
 * Sets <title>, meta description, canonical link, robots meta, and Open Graph /
 * Twitter tags for the current route. Because this app is a client-rendered SPA
 * (no SSR/prerendering), these tags are written on mount/route-change — good
 * enough for social share unfurls and for crawlers that execute JS (Googlebot),
 * but if you need guaranteed metadata for every bot, consider prerendering
 * (e.g. `vite-plugin-ssr`, Netlify Prerendering, or a static export per route).
 *
 * @param {Object} opts
 * @param {string} opts.title - Full page title, e.g. "Gallery | ART By Hannaah"
 * @param {string} opts.description - 150-160 char meta description
 * @param {string} [opts.path] - route path for canonical + og:url, e.g. "/case-studies"
 * @param {string} [opts.image] - absolute URL to a 1200x630 share image
 * @param {boolean} [opts.noindex] - set true for 404 / admin / thank-you pages
 */
export function useDocumentHead({ title, description, path = '/', image, noindex = false }) {
  useEffect(() => {
    if (title) document.title = title;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:url', `${SITE_URL}${path}`);
    setMeta('property', 'og:image', image || DEFAULT_OG_IMAGE);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image || DEFAULT_OG_IMAGE);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    setCanonical(`${SITE_URL}${path}`);
  }, [title, description, path, image, noindex]);
}

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Injects a <script type="application/ld+json"> block identified by `id`,
 * replacing any previous block with the same id. Removes it on unmount.
 */
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      // Leave it in place across route changes that reuse the same id;
      // only strip it if this exact instance is unmounting for good.
      const stale = document.getElementById(id);
      if (stale) stale.remove();
    };
  }, [id, JSON.stringify(data)]);
}

export function breadcrumbJsonLd(items) {
  // items: [{ name, path }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE };
