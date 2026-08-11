import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useRouter } from '../lib/router';
import { trackEvent } from '../lib/analytics';

/**
 * Fixed bottom bar shown only on mobile (md:hidden). Kept out of the way of
 * the Sonner toaster (bottom-right) and given safe-area padding for iOS.
 */
const StickyMobileCTA = () => {
  const { path, navigate } = useRouter();

  // Hide on the admin dashboard and thank-you page — not conversion contexts.
  if (path.startsWith('/admin') || path.startsWith('/thank-you')) return null;

  const goToCustomRequest = () => {
    trackEvent('cta_click', { cta_location: 'sticky_mobile_bar', cta_label: 'commission_art' });
    if (path !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch gap-2 p-3">
        <a
          href="https://wa.me/923038907552"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('cta_click', { cta_location: 'sticky_mobile_bar', cta_label: 'whatsapp' })}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-black text-black rounded-full py-3 text-sm font-medium uppercase tracking-wide"
          aria-label="Message us on WhatsApp"
        >
          <MessageCircle size={16} />
          Chat
        </a>
        <button
          onClick={goToCustomRequest}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-full py-3 text-sm font-medium uppercase tracking-wide"
        >
          <Sparkles size={16} />
          Commission Art
        </button>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
