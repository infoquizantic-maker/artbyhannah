import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ArrowLeft, Loader2, MessageCircleHeart, Send, CheckCircle2, ShieldCheck, Ruler, Palette, AlertTriangle, ImageOff } from 'lucide-react';
import { formatPKR } from '../lib/currency';
import { sendNotificationEmail } from '../lib/notify';
import { toast } from 'sonner';
import { useRouter } from '../lib/router';
import { useDocumentHead, useJsonLd } from '../lib/seo';
import { trackLead } from '../lib/analytics';
import Breadcrumbs from './Breadcrumbs';
import { inquirySchema, submitForm } from '../lib/validation';

const ProductPage = ({ id }) => {
  const { navigate } = useRouter();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    let cancelled = false;
    const fetchArtwork = async () => {
      setLoading(true);
      setNotFound(false);
      setLoadError(null);
      setActiveImage(0);
      const { data, error } = await supabase.from('artworks').select('*').eq('id', id).maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('Error fetching artwork:', error);
        setLoadError("Couldn't load this artwork. Please refresh or try again.");
        setLoading(false);
        return;
      }
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArtwork(data);
      setForm((f) => ({ ...f, message: `Hi Hannah, I'd love to know more about "${data.title}" — is it still available?` }));

      // Fetch a few related pieces from the same category (best-effort; ignore failures)
      const { data: relData } = await supabase
        .from('artworks')
        .select('*')
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(3);
      if (!cancelled) setRelated(relData || []);
      if (!cancelled) setLoading(false);
    };
    fetchArtwork();
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsed = inquirySchema.safeParse({
      ...form,
      items: [{ id: artwork.id, title: artwork.title }],
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Please check your form.');
      return;
    }

    setSubmitting(true);
    try {
      // Goes through the rate-limited Netlify Function instead of
      // inserting into Supabase directly from the browser — see
      // netlify/functions/submit-form.js.
      await submitForm('inquiries', parsed.data);

      sendNotificationEmail({
        form_type: 'Artwork Inquiry',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message,
        artwork_title: artwork.title,
        artwork_price: formatPKR(artwork.price),
      });

      trackLead('artwork_inquiry', { artwork_title: artwork.title });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not send your request. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-gray-400" size={40} />
        <p className="text-gray-500">Loading artwork...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Artwork not found</h1>
        <p className="text-gray-500">This piece may have been sold or removed.</p>
        <Button onClick={() => navigate('/')} className="bg-black text-white rounded-full px-6">
          <ArrowLeft className="mr-2" size={18} /> Back to gallery
        </Button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="text-red-400" size={36} />
        <h1 className="text-2xl font-bold text-gray-900">Couldn't load this artwork</h1>
        <p className="text-gray-500 max-w-md">{loadError}</p>
        <Button onClick={() => navigate('/')} className="bg-black text-white rounded-full px-6">
          <ArrowLeft className="mr-2" size={18} /> Back to gallery
        </Button>
      </div>
    );
  }

  const images = Array.isArray(artwork.images) && artwork.images.length > 0
    ? artwork.images.map((i) => i.url)
    : (artwork.cover_image ? [artwork.cover_image] : []);

  return (
    <ProductPageContent
      artwork={artwork}
      images={images}
      activeImage={activeImage}
      setActiveImage={setActiveImage}
      navigate={navigate}
      showForm={showForm}
      setShowForm={setShowForm}
      submitting={submitting}
      submitted={submitted}
      form={form}
      setForm={setForm}
      handleSubmit={handleSubmit}
      related={related}
    />
  );
};

const ProductPageContent = ({
  artwork, images, activeImage, setActiveImage, navigate, showForm, setShowForm,
  submitting, submitted, form, setForm, handleSubmit, related,
}) => {
  useDocumentHead({
    title: `${artwork.title} | ART By Hannaah`,
    description: (artwork.description || `A handcrafted original ${artwork.category?.toLowerCase() || 'artwork'} piece by ART By Hannaah.`).slice(0, 160),
    path: `/art/${artwork.id}`,
    image: images[0],
  });

  useJsonLd('product-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: artwork.title,
    description: artwork.description || undefined,
    image: images.length ? images : undefined,
    category: artwork.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: artwork.price,
      availability: 'https://schema.org/InStock',
    },
  });

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumbs items={[{ name: 'Gallery', path: '/' }, { name: artwork.title, path: `/art/${artwork.id}` }]} />

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Gallery
        </button>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Image gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden shadow-xl bg-gray-50 aspect-square flex items-center justify-center">
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={artwork.title} className="w-full h-full object-cover" />
              ) : (
                <ImageOff className="text-gray-300" size={64} />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${artwork.title} — view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <Badge className="mb-4 bg-purple-100 text-purple-800 rounded-full">{artwork.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">{artwork.title}</h1>
            <div className="text-3xl font-bold text-gray-900 mb-6">{formatPKR(artwork.price)}</div>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
              {artwork.description || 'A handcrafted original piece, made with premium materials and a lot of heart.'}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <Palette className="text-purple-600 shrink-0" size={22} />
                <div>
                  <div className="text-xs text-gray-500">Medium</div>
                  <div className="font-medium text-gray-900">{artwork.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <ShieldCheck className="text-green-600 shrink-0" size={22} />
                <div>
                  <div className="text-xs text-gray-500">Authenticity</div>
                  <div className="font-medium text-gray-900">100% Handmade Original</div>
                </div>
              </div>
            </div>

            {!showForm && !submitted && (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 rounded-full py-6 px-10 text-base uppercase tracking-wider shadow-lg"
              >
                <MessageCircleHeart className="mr-2" size={20} />
                Request This Piece
              </Button>
            )}

            {!showForm && !submitted && (
              <p className="text-sm text-gray-400 mt-3">No payment required to inquire — Hannah will reply by email to arrange purchase &amp; delivery.</p>
            )}

            {submitted && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex gap-4 items-start">
                <CheckCircle2 className="text-green-600 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Request sent!</h3>
                  <p className="text-gray-600 text-sm">Hannah has received your interest in "{artwork.title}" and will get back to you by email soon.</p>
                </div>
              </div>
            )}

            {showForm && !submitted && (
              <div className="bg-gray-50 rounded-2xl p-6 mt-2 border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Tell Hannah you're interested</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pname">Your Name *</Label>
                      <Input id="pname" required maxLength={120} disabled={submitting} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-white" />
                    </div>
                    <div>
                      <Label htmlFor="pemail">Email *</Label>
                      <Input id="pemail" type="email" required maxLength={200} disabled={submitting} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 bg-white" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pphone">Phone (optional)</Label>
                    <Input id="pphone" type="tel" maxLength={30} disabled={submitting} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 bg-white" />
                  </div>
                  <div>
                    <Label htmlFor="pmessage">Message *</Label>
                    <Textarea id="pmessage" required maxLength={5000} disabled={submitting} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 bg-white min-h-28" />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting} className="flex-1 bg-black text-white hover:bg-gray-800 rounded-full py-6 uppercase tracking-wider text-sm">
                      {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
                      {submitting ? 'Sending...' : 'Send Request'}
                    </Button>
                    <Button type="button" variant="outline" disabled={submitting} onClick={() => setShowForm(false)} className="rounded-full py-6">
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Related artworks */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">More from this collection</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((art) => {
                const cover = art.cover_image || art.images?.[0]?.url;
                return (
                  <button
                    key={art.id}
                    onClick={() => navigate(`/art/${art.id}`)}
                    className="text-left group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {cover ? (
                        <img src={cover} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageOff size={28} /></div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <h3 className="font-bold text-gray-900">{art.title}</h3>
                      <p className="text-gray-600 mt-1">{formatPKR(art.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
