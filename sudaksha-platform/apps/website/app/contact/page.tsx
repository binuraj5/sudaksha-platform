'use client';

import { useState } from 'react';
import { useCTACapture } from '@/hooks/useCTACapture';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  Send, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Clock,
  ArrowRight,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { capture } = useCTACapture();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    await capture({
      sourcePage: '/contact',
      ctaLabel: 'Send Message',
      ctaType: 'form_submit',
      intent: 'general_inquiry',
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitted(false);
      setErrors({});
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Chat with Us',
      description: 'Instant support via WhatsApp',
      action: 'https://wa.me/919121044435',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      icon: Phone,
      title: 'Book a Call',
      description: 'Schedule a consultation',
      action: 'tel:+919121044435',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come to our office',
      action: '#location',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
              Have questions about our programs? We're here to help you start your career journey.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Contact Form */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Mail className="w-8 h-8 mr-3 text-blue-400" />
                Send us a Message
              </h2>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder=" "
                      className={`peer w-full px-4 py-4 bg-white/10 border-2 rounded-2xl text-white placeholder-transparent transition-all duration-300 focus:bg-white/20 focus:border-blue-400 focus:outline-none ${
                        errors.name ? 'border-red-400' : 'border-white/30'
                      }`}
                    />
                    <label className="absolute left-4 top-4 text-blue-300 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-blue-400">
                      Your Name *
                    </label>
                    {errors.name && (
                      <div className="flex items-center mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder=" "
                      className={`peer w-full px-4 py-4 bg-white/10 border-2 rounded-2xl text-white placeholder-transparent transition-all duration-300 focus:bg-white/20 focus:border-blue-400 focus:outline-none ${
                        errors.email ? 'border-red-400' : 'border-white/30'
                      }`}
                    />
                    <label className="absolute left-4 top-4 text-blue-300 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-blue-400">
                      Email Address *
                    </label>
                    {errors.email && (
                      <div className="flex items-center mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder=" "
                      rows={5}
                      className={`peer w-full px-4 py-4 bg-white/10 border-2 rounded-2xl text-white placeholder-transparent transition-all duration-300 focus:bg-white/20 focus:border-blue-400 focus:outline-none resize-none ${
                        errors.message ? 'border-red-400' : 'border-white/30'
                      }`}
                    />
                    <label className="absolute left-4 top-4 text-blue-300 text-sm transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:-top-6 peer-focus:text-xs peer-focus:text-blue-400 peer-valid:-top-6 peer-valid:text-xs peer-valid:text-blue-400">
                      Your Message *
                    </label>
                    {errors.message && (
                      <div className="flex items-center mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.message}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Thank you, {formData.name || 'friend'}!</h3>
                  <p className="text-blue-300">We'll get back to you within 2 business hours.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Quick Actions & Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.action}
                    className={`group block bg-gradient-to-r ${action.color} ${action.hoverColor} text-white p-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                        <p className="text-white/80 text-sm">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Phone</h3>
                    <p className="text-blue-300">+91 91210 44435</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email</h3>
                    <p className="text-blue-300">info@sudaksha.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Office</h3>
                    <p className="text-blue-300">3rd Floor, Plot No. 705<br />Road No.36, Jubilee Hills<br />Hyderabad, Telangana 500033</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Business Hours</h3>
                    <p className="text-blue-300">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Follow Us</h2>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div id="location" className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Visit Our Office</h2>
            <div className="rounded-2xl overflow-hidden h-96 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-400 mb-4 mx-auto" />
                <p className="text-white text-lg mb-2">Hyderabad Office</p>
                <p className="text-blue-300">3rd Floor, Plot No. 705, Road No.36<br />Jubilee Hills, Hyderabad 500033</p>
                <a 
                  href="https://maps.google.com/?q=Jubilee+Hills,+Hyderabad+500033"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 mt-4 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

