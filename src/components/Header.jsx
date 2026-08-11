import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from '../lib/router';

const Header = () => {
  const { path, navigate } = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goHomeThenScroll = (sectionId) => {
    setIsMenuOpen(false);
    if (path !== '/') {
      navigate('/');
      // wait a tick for Home to mount, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <h1
              className="brand-font text-2xl font-bold tracking-tight text-black cursor-pointer"
              onClick={() => goHomeThenScroll('home')}
            >
              ART By Hannaah
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['home', 'gallery', 'custom', 'about', 'testimonials'].map((section) => (
              <button
                key={section}
                onClick={() => goHomeThenScroll(section)}
                className="nav-link text-base font-normal text-black hover:text-gray-600 capitalize transition-colors"
              >
                {section === 'custom' ? 'Custom Art' : section === 'testimonials' ? 'Reviews' : section}
              </button>
            ))}
            <button
              onClick={() => { setIsMenuOpen(false); navigate('/case-studies'); }}
              className="nav-link text-base font-normal text-black hover:text-gray-600 transition-colors"
            >
              Case Studies
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <Button
              onClick={() => goHomeThenScroll('custom')}
              className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 text-sm uppercase tracking-wider transition-all"
            >
              <Sparkles size={14} className="mr-1.5" />
              Custom Art
            </Button>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {['home', 'gallery', 'custom', 'about', 'testimonials'].map((section) => (
                <button
                  key={section}
                  onClick={() => goHomeThenScroll(section)}
                  className="text-left text-base font-normal text-black hover:text-gray-600 transition-colors"
                >
                  {section === 'custom' ? 'Custom Art' : section === 'testimonials' ? 'Reviews' : section}
                </button>
              ))}
              <button
                onClick={() => { setIsMenuOpen(false); navigate('/case-studies'); }}
                className="text-left text-base font-normal text-black hover:text-gray-600 transition-colors"
              >
                Case Studies
              </button>

              <Button
                onClick={() => goHomeThenScroll('custom')}
                className="bg-black text-white hover:bg-gray-800 rounded-full px-6 py-2 text-sm uppercase tracking-wider w-full transition-all"
              >
                Commission Art
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
