import React from 'react';
import { User, Heart, Palette, Award } from 'lucide-react';
import { useRouter } from '../lib/router';

const About = () => {
  const { navigate } = useRouter();
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5"
                  alt="Hannah painting in studio"
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-yellow-300 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-pink-300 rounded-full opacity-30 blur-3xl"></div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                <User size={16} />
                <span>Meet The Artist</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-gray-900">
                About Hannaah
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Hi! I'm Hannaah, a passionate artist specializing in vibrant canvas paintings and intricate sketches. 
                Art has been my lifelong companion, and I believe every space deserves a unique piece that tells a story.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                With over 2 years of experience, I've created hundreds of artworks for homes, offices, and galleries. 
                My style blends bold colors with emotional depth, creating pieces that don't just decorate walls-they 
                transform spaces and spark conversations.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Each painting is crafted by hand using premium materials, ensuring that your artwork remains vibrant 
                and beautiful for years to come. Whether you choose from my existing collection or commission a custom 
                piece, you're investing in art made with love and dedication.
              </p>

              <p className="text-lg text-gray-600 leading-relaxed">
                Curious what the process actually looks like? Take a look at a few{' '}
                <button
                  onClick={() => navigate('/case-studies')}
                  className="text-black font-medium underline underline-offset-2 hover:text-purple-700"
                >
                  recent case studies
                </button>{' '}
                from brief to finished canvas.
              </p>

              {/* Stats/Features */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Palette className="text-purple-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">2+ Years</div>
                    <div className="text-sm text-gray-600">Experience</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Heart className="text-pink-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">50+</div>
                    <div className="text-sm text-gray-600">Artworks</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="text-orange-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">30+</div>
                    <div className="text-sm text-gray-600">Happy Clients</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="text-yellow-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Premium</div>
                    <div className="text-sm text-gray-600">Quality</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
