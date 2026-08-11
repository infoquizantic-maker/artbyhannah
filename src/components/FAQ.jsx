import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useJsonLd } from '../lib/seo';

const FAQS = [
  {
    q: 'How long does a custom painting take to complete?',
    a: 'Most custom commissions take 1–3 weeks depending on size and detail, from the time your concept and deposit are confirmed. Rush timelines can sometimes be accommodated — just mention your deadline in the custom request form.',
  },
  {
    q: 'How much does a custom artwork cost?',
    a: 'Pricing depends on canvas size and style, starting around Rs 4,500 for an 8"x10" piece and scaling up for larger canvases and more detailed work. You\'ll see exact pricing as you fill out the custom request form, before you commit.',
  },
  {
    q: 'Do you ship artwork, or is pickup only?',
    a: 'Both are available. Local clients in Multan can arrange studio pickup by appointment, and pieces can also be carefully packaged and shipped nationwide — shipping cost depends on canvas size and destination.',
  },
  {
    q: "What if I don't love the final piece?",
    a: "Before painting begins, you'll review a concept sketch or reference plan so there are no surprises. If something needs adjusting once it's underway, reach out as early as possible — reasonable revisions are part of the process for custom commissions.",
  },
  {
    q: 'How do I start a custom commission?',
    a: "Fill out the Custom Art request form with your size, style, and budget, or send a message through the contact form. You'll hear back within 24 hours to confirm details and next steps.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  useJsonLd('faq-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  });

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle size={16} />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Got Questions?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know before commissioning your first piece.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={item.q} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <span className="font-semibold text-gray-900">{item.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div id={`faq-answer-${i}`} className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
