import React from 'react';
import { Button } from './ui/button';
import { Palette, Sparkles, PenTool } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Background with vibrant color */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"></div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in pt-4">
            {/* Added pt-2 for extra headroom above the pill badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              <PenTool size={16} />
              <span>Get Personalized Artwork</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
              Custom Art,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
                Made Just For You
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Tell us your vision and we'll hand-paint it — a one-of-a-kind canvas, portrait,
              or sketch designed around your space, your story, and your style. Browse the
              gallery for inspiration, or commission something entirely your own.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                onClick={() => scrollToSection('custom')}
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-base uppercase tracking-wider transition-all transform hover:scale-105"
              >
                <Sparkles className="mr-2" size={20} />
                Request Custom Artwork
              </Button>
              <Button
                onClick={() => scrollToSection('gallery')}
                variant="outline"
                className="border-2 border-black text-black hover:bg-black hover:text-white rounded-full px-8 py-6 text-base uppercase tracking-wider transition-all"
              >
                <Palette className="mr-2" size={20} />
                Browse Gallery
              </Button>
            </div>

            {/* Stats - pulled slightly upward (-mt-2 / pt-4) away from the bottom hero edge */}
            <div className="grid grid-cols-3 gap-6 pt-4 -mt-2">
              <div>
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Artworks Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">30+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4★</div>
                <div className="text-sm text-gray-600">Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Art */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <img
                src="https://i.postimg.cc/QtXn87NG/alif.jpg"
                alt="Featured custom artwork"
                className="w-full h-[580px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Alif (Sold Out)</h3>
                  <p className="text-white/90">
                    A dance of faith carved in gold and white — Original Artwork
                  </p>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-300 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-pink-300 rounded-full opacity-50 blur-3xl"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;