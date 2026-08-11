import React, { useState } from 'react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { CASE_STUDIES } from '../mockData';
import { useRouter } from '../lib/router';
import { useDocumentHead } from '../lib/seo';
import Breadcrumbs from './Breadcrumbs';

const CaseStudies = () => {
  const { navigate } = useRouter();
  const [openSlug, setOpenSlug] = useState(null);

  useDocumentHead({
    title: 'Case Studies | ART By Hannaah',
    description: 'Real custom art commissions from concept to finished canvas — see how ART By Hannaah plans, paints, and delivers one-of-a-kind pieces for clients.',
    path: '/case-studies',
  });

  const activeStudy = CASE_STUDIES.find((c) => c.slug === openSlug);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumbs items={[{ name: 'Case Studies', path: '/case-studies' }]} />

        <div className="max-w-3xl mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Project Case Studies
          </h1>
          <p className="text-lg text-gray-600">
            A closer look at how a handful of custom commissions came together — the brief, the process,
            and the finished piece. Curious what a piece like this could look like for your own space?{' '}
            <button onClick={() => goToCustom(navigate)} className="text-black font-medium underline underline-offset-2">
              Start your own custom request
            </button>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CASE_STUDIES.map((study) => (
            <button
              key={study.slug}
              onClick={() => setOpenSlug(study.slug)}
              className="text-left group rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={study.image}
                  alt={`${study.title} — finished artwork`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-wider text-purple-600 font-medium">{study.category}</span>
                <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">{study.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{study.summary}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-black">
                  Read the full breakdown <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeStudy && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpenSlug(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={activeStudy.image}
                alt={`${activeStudy.title} — finished artwork`}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setOpenSlug(null)}
                className="absolute top-4 right-4 bg-white/90 rounded-full p-2"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-8">
              <span className="text-xs uppercase tracking-wider text-purple-600 font-medium">{activeStudy.category}</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{activeStudy.title}</h2>
              <p className="text-sm text-gray-500 mb-6">{activeStudy.client}</p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">The Brief</h3>
                  <p>{activeStudy.challenge}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">The Process</h3>
                  <p>{activeStudy.process}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">The Result</h3>
                  <p>{activeStudy.result}</p>
                </div>
              </div>

              <Button
                onClick={() => goToCustom(navigate)}
                className="mt-8 bg-black text-white hover:bg-gray-800 rounded-full px-6"
              >
                <Sparkles className="mr-2" size={16} />
                Start a project like this
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function goToCustom(navigate) {
  navigate('/');
  setTimeout(() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' }), 50);
}

export default CaseStudies;
