import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { customPaintingOptions } from '../mockData';
import { Palette, Sparkles, CheckCircle2, Loader2, X, PartyPopper, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

import { sendNotificationEmail } from '../lib/notify';
import { useRouter } from '../lib/router';
import { trackLead } from '../lib/analytics';
import { customRequestSchema, submitForm } from '../lib/validation';

const CustomRequest = () => {
  const { toast } = useToast();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Pop-up State
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    size: '',
    style: '',
    budget: '',
    description: '',
    deadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsed = customRequestSchema.safeParse(formData);
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Please check your form",
        description: parsed.error.issues[0]?.message || "Some fields need attention.",
      });
      return;
    }

    setLoading(true);

    try {
      // Goes through the rate-limited Netlify Function instead of
      // inserting into Supabase directly from the browser — see
      // netlify/functions/submit-form.js.
      await submitForm("custom_requests", parsed.data);

      // Email notification (best-effort — the request is already saved above,
      // so it's visible in /admin regardless of whether this succeeds)
      sendNotificationEmail({
        form_type: 'Custom Artwork Request',
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        size: parsed.data.size,
        style: parsed.data.style,
        budget: parsed.data.budget,
        deadline: parsed.data.deadline,
        message: parsed.data.description,
      });

      // Trigger Pop-up
      trackLead('custom_art_request');
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        name: '', email: '', phone: '', size: '', style: '', budget: '', description: '', deadline: ''
      });
    } catch (error) {
      console.error("Error submitting custom request:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error sending your request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="custom" className="py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>Our Special Service</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Commission Your Dream Art
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have a vision? Let's bring it to life together. Request a custom painting tailored to your style, space, and story.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Commission Custom Art?</h3>
                <div className="space-y-6">
                  {[
                    { title: "Perfectly Personalized", desc: "Every detail crafted to match your vision and space.", color: "orange" },
                    { title: "Unique & Original", desc: "One-of-a-kind artwork that no one else will ever have.", color: "pink" },
                    { title: "Collaborative Process", desc: "Work directly with Hannah throughout the creation.", color: "purple" },
                    { title: "Quality Guarantee", desc: "Premium materials for lasting beauty.", color: "yellow" }
                  ].map((benefit, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-full flex items-center justify-center`}>
                          <CheckCircle2 className={`text-${benefit.color}-600`} size={24} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                        <p className="text-gray-600">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1618331835717-801e976710b2"
                  alt="Custom artwork example"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="text-purple-600" size={32} />
                <h3 className="text-2xl font-bold text-gray-900">Request Custom Art</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name"
                    required
                    maxLength={120}
                    disabled={loading}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      required
                      maxLength={200}
                      disabled={loading}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      required
                      maxLength={30}
                      disabled={loading}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(123) 456-7890"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Canvas Size *</Label>
                    <Select 
                      disabled={loading}
                      value={formData.size} 
                      onValueChange={(value) => setFormData({...formData, size: value})}
                    >
                      <SelectTrigger id="size" className="mt-2 bg-white border-gray-200">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      {/* CSS FIX: Solid background and high Z-index */}
                      <SelectContent className="bg-white border-gray-200 shadow-xl z-[100]">
                        {customPaintingOptions.sizes.map((size) => (
                          <SelectItem key={size.value} value={size.value} className="cursor-pointer focus:bg-purple-50">
                            {size.label} - Starting Rs {size.price.toLocaleString('en-PK')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="style">Art Style *</Label>
                    <Select 
                      disabled={loading}
                      value={formData.style} 
                      onValueChange={(value) => setFormData({...formData, style: value})}
                    >
                      <SelectTrigger id="style" className="mt-2 bg-white border-gray-200">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-xl z-[100]">
                        {customPaintingOptions.styles.map((style) => (
                          <SelectItem key={style.value} value={style.value} className="cursor-pointer focus:bg-purple-50">
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Budget Range *</Label>
                  <Select 
                    disabled={loading}
                    value={formData.budget} 
                    onValueChange={(value) => setFormData({...formData, budget: value})}
                  >
                    <SelectTrigger id="budget" className="mt-2 bg-white border-gray-200">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-xl z-[100]">
                      {customPaintingOptions.budgetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value} className="cursor-pointer focus:bg-purple-50">
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deadline">Preferred Deadline (Optional)</Label>
                  <Input 
                    id="deadline"
                    type="date"
                    disabled={loading}
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Describe Your Vision *</Label>
                  <Textarea 
                    id="description"
                    required
                    maxLength={5000}
                    disabled={loading}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tell us about colors, themes, mood, or any specific details..."
                    className="mt-2 min-h-32"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6 text-base uppercase tracking-wider transition-all shadow-lg active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="mr-2 animate-spin" size={20} />
                  ) : (
                    <Palette className="mr-2" size={20} />
                  )}
                  {loading ? "Sending..." : "Submit Request"}
                </Button>
                <p className="flex items-center justify-center gap-1.5 text-sm text-gray-500">
                  <Clock size={14} />
                  We respond within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUCCESS POP-UP MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="text-green-600" size={40} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-600 mb-8">
              Your vision has been shared with Hannah. She'll review the details and contact you via email soon!
            </p>
            
            <Button 
              onClick={() => { setShowSuccessModal(false); navigate('/thank-you?source=custom_request'); }}
              className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6 font-bold"
            >
              View Next Steps
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CustomRequest;