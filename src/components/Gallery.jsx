import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Loader2, AlertTriangle, ImageOff } from 'lucide-react';
import { Button } from './ui/button';
import { formatPKR } from '../lib/currency';
import { ARTWORK_CATEGORIES } from '../mockData';
import { useRouter } from '../lib/router';

const Gallery = () => {
  const { navigate } = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('all');

  const categories = ['all', ...ARTWORK_CATEGORIES];

  useEffect(() => {
    let cancelled = false;

    const fetchArtworks = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("Error fetching artworks:", error);
        setLoadError(
          error.code === '42501'
            ? "The gallery couldn't load because Supabase's Row Level Security is blocking public reads of the 'artworks' table. See SUPABASE_SETUP_GUIDE.md for the policies to use."
            : "The gallery couldn't load right now. Please refresh, or check your internet connection."
        );
        setLoading(false);
        return;
      }
      setArtworks(data || []);
      setLoading(false);
    };

    fetchArtworks();
    return () => { cancelled = true; };
  }, []);

  const filteredArtworks = filter === 'all'
    ? artworks
    : artworks.filter(art => art.category === filter);

  const coverOf = (art) => art.cover_image || art.images?.[0]?.url;

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Art Gallery
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of handcrafted paintings and sketches. Each piece is unique and created with passion — click any piece to see it up close.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full text-sm uppercase tracking-wider font-medium transition-all ${
                filter === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Artworks' : category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Loading the gallery...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <AlertTriangle className="text-red-400" size={40} />
            <p className="text-gray-600 max-w-md">{loadError}</p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No artworks in this category yet — check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredArtworks.map((artwork) => {
              const cover = coverOf(artwork);
              return (
                <Card
                  key={artwork.id}
                  onClick={() => navigate(`/art/${artwork.id}`)}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-lg cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={artwork.title}
                        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-300">
                        <ImageOff size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <Button
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 bg-white text-black hover:bg-gray-100 rounded-full"
                        onClick={(e) => { e.stopPropagation(); navigate(`/art/${artwork.id}`); }}
                      >
                        <Eye size={20} />
                      </Button>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-white/90 text-black hover:bg-white rounded-full px-3 py-1">
                      {artwork.category}
                    </Badge>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-pink-50">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{artwork.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{formatPKR(artwork.price)}</span>
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/art/${artwork.id}`); }}
                        className="bg-black text-white hover:bg-gray-800 rounded-full px-4 py-2 text-xs uppercase tracking-wider transition-all"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
