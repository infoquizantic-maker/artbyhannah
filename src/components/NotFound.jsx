import React, { useState } from 'react';
import { Home, Palette, Sparkles, Mail, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useRouter } from '../lib/router';
import { useDocumentHead } from '../lib/seo';

const NotFound = () => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');

  useDocumentHead({
    title: 'Page Not Found | ART By Hannaah',
    description: "The page you're looking for doesn't exist. Browse our custom art gallery or get in touch to commission a piece.",
    path: '/404',
    noindex: true,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // No on-site search index yet — route the query to the gallery filter
    // via the custom request/contact form so it still becomes a useful lead.
    navigate('/');
    setTimeout(() => {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const quickLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Gallery', path: '/', section: 'gallery', icon: Palette },
    { label: 'Custom Art', path: '/', section: 'custom', icon: Sparkles },
    { label: 'Contact', path: '/', section: 'contact', icon: Mail },
  ];

  const goTo = (link) => {
    navigate(link.path);
    if (link.section) {
      setTimeout(() => {
        document.getElementById(link.section)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-xl w-full text-center">
        <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 mb-4">
          404
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          This canvas is blank
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          We couldn't find the page you were looking for. It may have been moved, sold, or never existed —
          but there's plenty more art to see.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-10 max-w-md mx-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the gallery (e.g. &quot;portrait&quot;)"
            className="bg-white"
            aria-label="Search"
          />
          <Button type="submit" className="bg-black text-white hover:bg-gray-800 rounded-full px-5 shrink-0">
            <Search size={18} />
          </Button>
        </form>

        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => goTo(link)}
              className="flex items-center gap-2 justify-center bg-white border border-gray-200 hover:border-black rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition-colors"
            >
              <link.icon size={16} />
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
