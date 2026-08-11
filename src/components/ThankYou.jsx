import React, { useEffect } from 'react';
import { CheckCircle2, Instagram, Palette, Home, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from '../lib/router';
import { useDocumentHead } from '../lib/seo';
import { trackEvent } from '../lib/analytics';

const ThankYou = () => {
  const { navigate, path } = useRouter();

  useDocumentHead({
    title: 'Thank You | ART By Hannaah',
    description: "Thanks for reaching out to ART By Hannaah — we've received your message and will respond within 24 hours.",
    path: '/thank-you',
    noindex: true,
  });

  // Fires once when the confirmation page itself loads — this is the
  // canonical "lead completed" conversion event to mark as a GA4/Google Ads
  // conversion goal (more reliable than tracking the form submit click,
  // since it only fires after a successful, page-loaded confirmation).
  useEffect(() => {
    trackEvent('generate_lead', { form_name: getSourceFromQuery(path) });
  }, [path]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-lg w-full text-center bg-white rounded-3xl shadow-xl p-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-600" size={36} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Thank You!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Your message has been received.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-4 py-2 rounded-full mb-8">
          <Clock size={15} />
          We respond within 24 hours
        </div>

        <div className="text-left bg-gray-50 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-3">What happens next?</h2>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>1. Hannah reviews your message and, for custom requests, sketches out a concept.</li>
            <li>2. You'll get a reply by email or phone to confirm details, pricing, and timeline.</li>
            <li>3. Once approved, your artwork goes into production.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-5"
          >
            <Home className="mr-2" size={18} />
            Back to Home
          </Button>
          <Button
            onClick={() => {
              navigate('/');
              setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 50);
            }}
            variant="outline"
            className="border-2 border-black text-black hover:bg-black hover:text-white rounded-full px-6 py-5"
          >
            <Palette className="mr-2" size={18} />
            Browse Gallery
          </Button>
        </div>

        <a
          href="https://www.instagram.com/art_by_hannahhhhh?igsh=MWU2YzdxNWFzcThueg=="
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mt-8 transition-colors"
        >
          <Instagram size={16} />
          Follow along on Instagram while you wait
        </a>
      </div>
    </div>
  );
};

function getSourceFromQuery(path) {
  try {
    const params = new URLSearchParams(path.split('?')[1] || window.location.search);
    return params.get('source') || 'unknown';
  } catch {
    return 'unknown';
  }
}

export default ThankYou;
