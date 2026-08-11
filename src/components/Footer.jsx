import React from 'react';
import { Heart, Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { useRouter } from '../lib/router';

const Footer = () => {
  const { navigate } = useRouter();
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4">ART By Hannaah</h3>
            <p className="text-gray-400 mb-6">
              Creating unique, handcrafted art that transforms spaces and tells stories.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/art_by_hannahhhhh?igsh=MWU2YzdxNWFzcThueg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="mailto:artbyhannah29@gmail.com"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('custom')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Custom Art
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/case-studies')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Case Studies
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              <li className="text-gray-400">Canvas Paintings</li>
              <li className="text-gray-400">Watercolor Sketches</li>
              <li className="text-gray-400">Abstract Art</li>
              <li className="text-gray-400">Custom Commissions</li>
              <li className="text-gray-400">Art Consultations</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li>artbyhannah29@gmail.com</li>
              <li>+92 3038907552</li>
              <li>Dream Garden, Multan</li>
              <li className="pt-2">
                <span className="text-white font-medium">Hours:</span><br />
                Mon-Fri: 9am-6pm PKT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} ART By Hannaah. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                Made for art lovers everywhere
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
