import React from 'react';
import { useDocumentHead } from '../lib/seo';
import Breadcrumbs from './Breadcrumbs';

const PrivacyPolicy = () => {
  useDocumentHead({
    title: 'Privacy Policy | ART By Hannaah',
    description: 'Learn how ART By Hannaah collects, uses, and protects your personal information when you contact us or request a custom artwork commission.',
    path: '/privacy-policy',
  });

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <Breadcrumbs items={[{ name: 'Privacy Policy', path: '/privacy-policy' }]} />

        <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: August 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Who We Are</h2>
            <p>
              ART By Hannaah ("we", "us", "our") is an independent art studio based in Multan, Pakistan,
              offering original artwork and custom commissions. This policy explains what information we
              collect through this website and how it's used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Information We Collect</h2>
            <p>When you use our contact form, custom art request form, or artwork inquiry form, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your name, email address, and phone number (where provided)</li>
              <li>The content of your message, including project details, size, style, and budget preferences</li>
              <li>Basic usage data (pages visited, general location, device/browser type) via Google Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To respond to your inquiry or custom art request, typically within 24 hours</li>
              <li>To manage and fulfill any commission or order you place with us</li>
              <li>To improve our website and understand how visitors use it (via aggregated analytics)</li>
            </ul>
            <p className="mt-2">We do not sell or rent your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Storage & Third Parties</h2>
            <p>
              Form submissions are stored securely using Supabase, our database provider. Website traffic is
              measured using Google Analytics (GA4), which may set cookies to distinguish visitors. You can
              opt out of Google Analytics tracking using the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-2"
              >
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Data Retention</h2>
            <p>
              We retain contact and commission form submissions for as long as reasonably necessary to manage
              our relationship with you and for our internal records. You may request deletion of your data at
              any time (see Section 7).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Cookies</h2>
            <p>
              This site uses cookies for essential site functionality and for analytics (Google Analytics).
              You can control or delete cookies through your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">7. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of the personal information we hold about
              you by emailing us at{' '}
              <a href="mailto:artbyhannah29@gmail.com" className="text-black underline underline-offset-2">
                artbyhannah29@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, reach out at{' '}
              <a href="mailto:artbyhannah29@gmail.com" className="text-black underline underline-offset-2">
                artbyhannah29@gmail.com
              </a>{' '}
              or +92 3038907552.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
