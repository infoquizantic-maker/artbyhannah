import React, { useState, useEffect, useRef } from 'react';
import { supabase, ARTWORK_BUCKET, ADMIN_EMAILS } from '../supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Trash2, Pencil, Plus, LogOut, X, UploadCloud, Star, ImageOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { ARTWORK_CATEGORIES } from '../mockData';
import { formatPKR } from '../lib/currency';

// Admin allow-list now lives in src/supabaseClient.js (ADMIN_EMAILS), kept in
// sync with the is_admin() function in supabase/schema.sql.

const CATEGORIES = ARTWORK_CATEGORIES;

// Server-side (Storage bucket) MIME/size limits should also be set in the
// Supabase Dashboard — Storage → artworks bucket → Edit bucket — since the
// `accept` attribute on <input type="file"> is a client-side hint only and
// doesn't stop a direct API call. These client-side checks just give a
// faster, friendlier error before that upload is attempted.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/* ---------------------------------------------------------- */
/* Shared bits                                                 */
/* ---------------------------------------------------------- */

const TabButton = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
      active ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {children}
    {typeof count === 'number' && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-300'}`}>
        {count}
      </span>
    )}
  </button>
);

const EmptyState = ({ label }) => (
  <div className="text-center py-16 text-gray-400">Nothing in {label} yet.</div>
);

const ErrorState = ({ message }) => (
  <div className="text-center py-16 text-red-500 flex flex-col items-center gap-3">
    <AlertTriangle size={32} />
    <p className="max-w-md text-sm">{message}</p>
  </div>
);

/* ---------------------------------------------------------- */
/* Artworks tab                                                */
/* ---------------------------------------------------------- */

const emptyArtwork = { title: '', category: CATEGORIES[0], price: '', description: '' };

const ArtworksTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(emptyArtwork);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local, not-yet-uploaded image state for the form
  const [existingImages, setExistingImages] = useState([]); // [{url, path}] already in Storage (when editing)
  const [newFiles, setNewFiles] = useState([]); // File objects picked from computer, not yet uploaded
  const [coverKey, setCoverKey] = useState(null); // url (existing) or local preview key (new file) marked as cover
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('artworks load error:', error);
      setLoading(false);
      setLoadError(
        error.code === '42501'
          ? "Access denied loading artworks. Check that you're signed in as an admin, then refresh."
          : "Couldn't load artworks. Please refresh or try again."
      );
      return;
    }
    setItems(data || []);
    setLoading(false);
    setLoadError(null);
  };

  useEffect(() => {
    loadItems();
    const channel = supabase
      .channel('admin-artworks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, loadItems)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const resetImageState = () => {
    newFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setExistingImages([]);
    setNewFiles([]);
    setCoverKey(null);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      category: item.category || CATEGORIES[0],
      price: item.price ?? '',
      description: item.description || '',
    });
    const imgs = Array.isArray(item.images) ? item.images : [];
    setExistingImages(imgs);
    setNewFiles([]);
    setCoverKey(item.cover_image || imgs[0]?.url || null);
    setShowForm(true);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyArtwork);
    resetImageState();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetImageState();
  };

  const handleFilesPicked = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: unsupported file type. Use JPEG, PNG, WEBP, or GIF.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name}: file too large (max 10MB).`);
        continue;
      }
      valid.push(file);
    }
    const withPreview = valid.map((file) => Object.assign(file, { previewUrl: URL.createObjectURL(file), _key: `new-${file.name}-${file.size}-${Date.now()}-${Math.random()}` }));
    setNewFiles((prev) => [...prev, ...withPreview]);
    if (!coverKey && withPreview.length > 0) setCoverKey(withPreview[0]._key);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img.url !== url));
    if (coverKey === url) setCoverKey(null);
  };

  const removeNewFile = (key) => {
    setNewFiles((prev) => {
      const target = prev.find((f) => f._key === key);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f._key !== key);
    });
    if (coverKey === key) setCoverKey(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const totalImages = existingImages.length + newFiles.length;
    if (totalImages === 0) {
      toast.error('Please add at least one photo of the artwork.');
      return;
    }

    setSaving(true);
    try {
      // 1. Upload any new files to Supabase Storage
      const uploaded = [];
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${newFiles.length}...`);
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
        const { error: uploadErr } = await supabase.storage.from(ARTWORK_BUCKET).upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
        });
        if (uploadErr) throw uploadErr;
        const { data: pub } = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
        uploaded.push({ url: pub.publicUrl, path, _key: file._key });
      }
      setUploadProgress('');

      // 2. Build final images array (existing kept + newly uploaded)
      const finalImages = [
        ...existingImages.map((img) => ({ url: img.url, path: img.path || null })),
        ...uploaded.map((u) => ({ url: u.url, path: u.path })),
      ];

      // 3. Resolve cover image URL (fall back to first image)
      let coverUrl = null;
      if (coverKey) {
        const fromExisting = existingImages.find((img) => img.url === coverKey);
        const fromUploaded = uploaded.find((u) => u._key === coverKey);
        coverUrl = fromExisting?.url || fromUploaded?.url || null;
      }
      if (!coverUrl) coverUrl = finalImages[0]?.url || null;

      const payload = {
        ...form,
        price: Number(form.price) || 0,
        images: finalImages,
        cover_image: coverUrl,
      };

      if (editingId) {
        const { error } = await supabase.from('artworks').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Artwork updated');
      } else {
        const { error } = await supabase.from('artworks').insert(payload);
        if (error) throw error;
        toast.success('Artwork added');
      }
      closeForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save artwork. Please try again.');
      setUploadProgress('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this artwork? This also removes its photos from Storage.')) return;
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', item.id);
      if (error) throw error;
      const imgs = Array.isArray(item.images) ? item.images : [];
      const paths = imgs.filter((img) => img.path).map((img) => img.path);
      if (paths.length > 0) {
        await supabase.storage.from(ARTWORK_BUCKET).remove(paths).catch(() => {});
      }
      toast.success('Artwork deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete artwork. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={startNew} className="bg-black text-white rounded-full">
          <Plus size={16} className="mr-2" /> Add Artwork
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8 border-0 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Edit Artwork' : 'New Artwork'}</h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-black">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Price (PKR) *</Label>
              <Input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1" placeholder="e.g. 15000" />
            </div>

            {/* Image upload */}
            <div className="md:col-span-2">
              <Label>Photos *</Label>
              <p className="text-xs text-gray-500 mt-1 mb-2">Upload one or more photos from your computer. Click the star to choose the cover photo shown in the gallery.</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                {existingImages.map((img) => (
                  <div key={img.url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverKey(img.url)}
                      title="Set as cover photo"
                      className={`absolute top-1 left-1 rounded-full p-1 shadow ${coverKey === img.url ? 'bg-yellow-400 text-white' : 'bg-white/90 text-gray-500 hover:text-yellow-500'}`}
                    >
                      <Star size={14} fill={coverKey === img.url ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.url)}
                      title="Remove photo"
                      className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                    {coverKey === img.url && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] text-center py-0.5">Cover</span>
                    )}
                  </div>
                ))}
                {newFiles.map((file) => (
                  <div key={file._key} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverKey(file._key)}
                      title="Set as cover photo"
                      className={`absolute top-1 left-1 rounded-full p-1 shadow ${coverKey === file._key ? 'bg-yellow-400 text-white' : 'bg-white/90 text-gray-500 hover:text-yellow-500'}`}
                    >
                      <Star size={14} fill={coverKey === file._key ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNewFile(file._key)}
                      title="Remove photo"
                      className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                    {coverKey === file._key && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] text-center py-0.5">Cover</span>
                    )}
                    <span className="absolute top-1 right-8 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">New</span>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                >
                  <UploadCloud size={22} />
                  <span className="text-[11px] mt-1">Add photos</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesPicked}
                className="hidden"
              />
              {existingImages.length + newFiles.length === 0 && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><ImageOff size={12} /> At least one photo is required.</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving} className="bg-black text-white rounded-full">
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {saving ? (uploadProgress || 'Saving...') : (editingId ? 'Save Changes' : 'Add Artwork')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 ? <EmptyState label="artworks" /> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((art) => {
            const cover = art.cover_image || art.images?.[0]?.url;
            const photoCount = art.images?.length || 0;
            return (
              <Card key={art.id} className="overflow-hidden border-0 shadow-md">
                <div className="relative">
                  {cover ? (
                    <img src={cover} alt={art.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300"><ImageOff size={28} /></div>
                  )}
                  {photoCount > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">{photoCount} photos</span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold">{art.title}</h4>
                      <Badge className="mt-1 bg-purple-100 text-purple-800">{art.category}</Badge>
                    </div>
                    <div className="text-lg font-bold whitespace-nowrap">{formatPKR(art.price)}</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{art.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => startEdit(art)} className="flex-1 rounded-full">
                      <Pencil size={14} className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(art)} className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------- */
/* Testimonials tab                                             */
/* ---------------------------------------------------------- */

const emptyTestimonial = { name: '', rating: 5, text: '', date_label: '' };

const TestimonialsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState(emptyTestimonial);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('testimonials load error:', error);
      setLoading(false);
      setLoadError("Couldn't load testimonials. Please refresh or try again.");
      return;
    }
    setItems(data || []);
    setLoading(false);
    setLoadError(null);
  };

  useEffect(() => {
    loadItems();
    const channel = supabase
      .channel('admin-testimonials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, loadItems)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name || '', rating: item.rating || 5, text: item.text || '', date_label: item.date_label || '' });
    setShowForm(true);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(emptyTestimonial);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) || 5 };
      if (editingId) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Testimonial updated');
      } else {
        const { error } = await supabase.from('testimonials').insert(payload);
        if (error) throw error;
        toast.success('Testimonial added');
      }
      setShowForm(false);
      setForm(emptyTestimonial);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save testimonial. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Testimonial deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete testimonial. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={startNew} className="bg-black text-white rounded-full">
          <Plus size={16} className="mr-2" /> Add Testimonial
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8 border-0 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-black">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Rating (1-5) *</Label>
              <Input required type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>Review Text *</Label>
              <Textarea required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Date label (e.g. "2 weeks ago")</Label>
              <Input value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving} className="bg-black text-white rounded-full">
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {editingId ? 'Save Changes' : 'Add Testimonial'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 ? <EmptyState label="testimonials" /> : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((t) => (
            <Card key={t.id} className="p-5 border-0 shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <div className="text-sm text-gray-500">{t.rating}★ · {t.date_label}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => startEdit(t)} className="rounded-full h-8 w-8">
                    <Pencil size={14} />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => handleDelete(t.id)} className="rounded-full h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">{t.text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------- */
/* Generic read/status inbox (Messages, Custom Requests, Inquiries) */
/* ---------------------------------------------------------- */

const InboxTab = ({ collectionName, statusOptions, renderBody, dateField }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from(collectionName)
      .select('*')
      .order(dateField, { ascending: false });
    if (error) {
      console.error(`${collectionName} load error:`, error);
      setLoading(false);
      setLoadError("Couldn't load this inbox. Please refresh or try again.");
      return;
    }
    setItems(data || []);
    setLoading(false);
    setLoadError(null);
  };

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    loadItems();
    const channel = supabase
      .channel(`admin-${collectionName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, loadItems)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [collectionName, dateField]);

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase.from(collectionName).update({ status }).eq('id', id);
      if (error) throw error;
      toast.success('Status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      const { error } = await supabase.from(collectionName).delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete entry. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>;
  if (loadError) return <ErrorState message={loadError} />;
  if (items.length === 0) return <EmptyState label={collectionName.replace('_', ' ')} />;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-5 border-0 shadow-md">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">{renderBody(item)}</div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {statusOptions && (
                <Select value={item.status || statusOptions[0]} onValueChange={(v) => updateStatus(item.id, v)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Button size="icon" variant="outline" onClick={() => handleDelete(item.id)} className="rounded-full h-8 w-8 text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const MessagesTab = () => (
  <InboxTab
    collectionName="contact_messages"
    dateField="submitted_at"
    statusOptions={['unread', 'read']}
    renderBody={(m) => (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold">{m.name}</h4>
          <span className="text-sm text-gray-400">{m.email}</span>
        </div>
        <div className="text-sm font-medium text-gray-700 mt-1">{m.subject}</div>
        <p className="text-sm text-gray-600 mt-2">{m.message}</p>
      </>
    )}
  />
);

const CustomRequestsTab = () => (
  <InboxTab
    collectionName="custom_requests"
    dateField="submitted_at"
    statusOptions={['pending', 'contacted', 'in progress', 'completed']}
    renderBody={(r) => (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold">{r.name}</h4>
          <span className="text-sm text-gray-400">{r.email} · {r.phone}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {r.size && <Badge className="mr-1 bg-gray-100 text-gray-700">{r.size}</Badge>}
          {r.style && <Badge className="mr-1 bg-gray-100 text-gray-700">{r.style}</Badge>}
          {r.budget && <Badge className="bg-gray-100 text-gray-700">{r.budget}</Badge>}
        </div>
        {r.deadline && <div className="text-xs text-gray-500 mt-1">Deadline: {r.deadline}</div>}
        <p className="text-sm text-gray-600 mt-2">{r.description}</p>
      </>
    )}
  />
);

const InquiriesTab = () => (
  <InboxTab
    collectionName="inquiries"
    dateField="created_at"
    statusOptions={['new', 'responded']}
    renderBody={(i) => (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold">{i.name || 'Website visitor'}</h4>
          <span className="text-sm text-gray-400">{i.email}{i.phone ? ` · ${i.phone}` : ''}</span>
        </div>
        {i.items?.length > 0 && (
          <div className="text-sm font-medium text-gray-700 mt-1">
            Re: {(i.items || []).map((it) => it.title).join(', ')}
          </div>
        )}
        <p className="text-sm text-gray-600 mt-2">{i.message}</p>
      </>
    )}
  />
);

/* ---------------------------------------------------------- */
/* Login form (email + password)                               */
/* ---------------------------------------------------------- */

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="mt-1"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full bg-black text-white rounded-full py-6">
          {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Sign in'}
        </Button>
      </form>
      <a href="/" className="text-sm text-gray-500 hover:underline">Back to site</a>
    </div>
  );
};

/* ---------------------------------------------------------- */
/* Top-level Admin page                                        */
/* ---------------------------------------------------------- */

const Admin = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('artworks');
  const [counts, setCounts] = useState({});

  useEffect(() => {
    // Get the current session immediately (handles page refresh / OAuth redirect return)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    // Keep in sync with sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const signOutAdmin = () => supabase.auth.signOut();

  // live badge counts for the inbox tabs
  useEffect(() => {
    if (!isAdmin) return;
    const tables = ['contact_messages', 'custom_requests', 'inquiries'];

    const loadCounts = async () => {
      const results = await Promise.all(
        tables.map((name) => supabase.from(name).select('*', { count: 'exact', head: true }))
      );
      setCounts((c) => {
        const next = { ...c };
        tables.forEach((name, i) => { next[name] = results[i].count ?? 0; });
        return next;
      });
    };

    loadCounts();
    const channels = tables.map((name) =>
      supabase
        .channel(`admin-count-${name}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: name }, loadCounts)
        .subscribe()
    );
    return () => channels.forEach((ch) => supabase.removeChannel(ch));
  }, [isAdmin]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Not Authorized</h1>
        <p className="text-gray-500">{user.email} doesn't have admin access.</p>
        <Button variant="outline" onClick={signOutAdmin} className="rounded-full">Sign out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">ART By Hannaah — Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{user.email}</span>
            <Button size="sm" variant="outline" onClick={signOutAdmin} className="rounded-full">
              <LogOut size={14} className="mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton active={tab === 'artworks'} onClick={() => setTab('artworks')}>Artworks</TabButton>
          <TabButton active={tab === 'testimonials'} onClick={() => setTab('testimonials')}>Testimonials</TabButton>
          <TabButton active={tab === 'messages'} onClick={() => setTab('messages')} count={counts.contact_messages}>Messages</TabButton>
          <TabButton active={tab === 'requests'} onClick={() => setTab('requests')} count={counts.custom_requests}>Custom Requests</TabButton>
          <TabButton active={tab === 'inquiries'} onClick={() => setTab('inquiries')} count={counts.inquiries}>Inquiries</TabButton>
        </div>

        {tab === 'artworks' && <ArtworksTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'messages' && <MessagesTab />}
        {tab === 'requests' && <CustomRequestsTab />}
        {tab === 'inquiries' && <InquiriesTab />}
      </div>
    </div>
  );
};

export default Admin;
