import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from './ui/card';
import { Star, Quote, Loader2, AlertTriangle } from 'lucide-react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("Error fetching testimonials:", error);
        setLoadError("Reviews couldn't be loaded right now. Please refresh the page.");
        setLoading(false);
        return;
      }
      setTestimonials(data || []);
      setLoading(false);
    };

    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star size={16} fill="currentColor" />
            <span>Customer Reviews</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            What People Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our amazing clients have to say about their experience.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-pink-400 mb-4" size={40} />
            <p className="text-gray-500 italic">Reading reviews...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <AlertTriangle className="text-red-400" size={32} />
            <p className="text-gray-600">{loadError}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No reviews yet — be the first!</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.id}
                className="p-8 bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.name ? testimonial.name.charAt(0) : "U"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(Number(testimonial.rating) || 5)].map((_, i) => (
                        <Star key={i} size={16} fill="#FFA500" stroke="#FFA500" />
                      ))}
                    </div>
                  </div>
                  <Quote className="text-purple-300" size={32} />
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  {testimonial.text}
                </p>

                <p className="text-sm text-gray-500">{testimonial.date_label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-8 bg-white rounded-2xl px-8 py-6 shadow-lg">
            <div className="flex items-center gap-2">
              <Star size={24} fill="#FFA500" stroke="#FFA500" />
              <div className="text-left">
                <div className="text-2xl font-bold text-gray-900">4.0</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300 hidden sm:block"></div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">30+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="h-12 w-px bg-gray-300 hidden sm:block"></div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">90%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;