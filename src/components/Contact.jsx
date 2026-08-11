import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Mail, Phone, MapPin, Send, Loader2, Clock } from 'lucide-react'; // Added Loader2
import { useToast } from '../hooks/use-toast';

import { sendNotificationEmail } from '../lib/notify';
import { useRouter } from '../lib/router';
import { trackLead } from '../lib/analytics';
import { contactSchema, submitForm } from '../lib/validation';

const Contact = () => {
  const { toast } = useToast();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false); // New loading state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsed = contactSchema.safeParse(formData);
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
      await submitForm("contact_messages", parsed.data);

      sendNotificationEmail({
        form_type: 'Contact Message',
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });

      trackLead('contact_form');

      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. Hannah will get back to you soon!",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      navigate('/thank-you?source=contact_form');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about an artwork? Want to discuss a custom commission? I'd love to hear from you!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Side - Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Let's Connect</h3>
                <p className="text-lg text-gray-600 mb-8">
                  Whether you're interested in purchasing existing artwork or commissioning a custom piece, 
                  I'm here to help bring your vision to life.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="text-purple-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">artbyhannah29@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center">
                      <Phone className="text-pink-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600">+92 3038907552</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-6pm</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                      <MapPin className="text-orange-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Studio Location</h4>
                    <p className="text-gray-600">Dream Garden, Multan</p>
                    <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="rounded-2xl overflow-hidden shadow-lg mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d" 
                  alt="Studio workspace"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Map & Directions */}
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <iframe
                  title="ART By Hannaah studio location map"
                  src="https://www.google.com/maps?q=Dream+Garden,+Multan,+Pakistan&output=embed"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                ></iframe>
                <div className="bg-orange-50 px-6 py-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Studio visits by appointment only.</span>{' '}
                    We're located in Dream Garden, Multan and also ship artwork nationwide across Pakistan —
                    message us to confirm availability before stopping by.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="contact-name">Your Name *</Label>
                  <Input 
                    id="contact-name"
                    type="text"
                    required
                    maxLength={120}
                    disabled={loading}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="mt-2 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email">Email Address *</Label>
                  <Input 
                    id="contact-email"
                    type="email"
                    required
                    maxLength={200}
                    disabled={loading}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="mt-2 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-subject">Subject *</Label>
                  <Input 
                    id="contact-subject"
                    type="text"
                    required
                    maxLength={200}
                    disabled={loading}
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="What's this about?"
                    className="mt-2 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-message">Message *</Label>
                  <Textarea 
                    id="contact-message"
                    required
                    maxLength={5000}
                    disabled={loading}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell me about your inquiry..."
                    className="mt-2 min-h-40 bg-white"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-full py-6 text-base uppercase tracking-wider transition-all"
                >
                  {loading ? (
                    <Loader2 className="mr-2 animate-spin" size={20} />
                  ) : (
                    <Send className="mr-2" size={20} />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;