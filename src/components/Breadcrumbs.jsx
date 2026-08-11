import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useRouter } from '../lib/router';
import { useJsonLd, breadcrumbJsonLd } from '../lib/seo';

/**
 * items: [{ name: 'Gallery', path: '/' }, { name: 'Alif', path: '/art/alif' }]
 * The last item is rendered as the current page (not a link).
 */
const Breadcrumbs = ({ items }) => {
  const { navigate } = useRouter();
  const fullTrail = [{ name: 'Home', path: '/' }, ...items];

  useJsonLd('breadcrumb-jsonld', breadcrumbJsonLd(fullTrail));

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
        {fullTrail.map((item, i) => {
          const isLast = i === fullTrail.length - 1;
          return (
            <li key={item.path + item.name} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="text-gray-300" aria-hidden="true" />}
              {isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  {i === 0 && <Home size={13} />}
                  {item.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
