'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { submitInquiry } = await import('@/lib/communication');

      const result = await submitInquiry({
        type: 'CONTACT_FORM',
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: 'Contact Form Submission',
        metadata: {
          source: 'Contact Page',
          userAgent: navigator.userAgent
        }
      });

      if (result.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setFormData({ name: '', email: '', message: '' });
          setIsSubmitted(false);
          setErrors({});
        }, 5000); // 5 seconds showing success message
      } else {
        setErrors(prev => ({ ...prev, form: 'Failed to submit message. Please try again.' }));
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(prev => ({ ...prev, form: 'An error occurred. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Chat with Us',
      description: 'Instant support via WhatsApp',
      action: 'https://wa.me/9191241044435',
      color: 'bg-green-50 text-green-700 border-green-200',
      hoverColor: 'hover:border-green-400'
    },
    {
      icon: Phone,
      title: 'Book a Call',
      description: 'Schedule a consultation',
      action: 'tel:+9191241044435',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverColor: 'hover:border-blue-400'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come to our office',
      action: '#location',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverColor: 'hover:border-purple-400'
    }
  ];

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'text-blue-700' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'text-blue-400' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'text-blue-800' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'text-pink-600' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-slate-900/40" />
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        {/* Glowing Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-100">
            Get in Touch
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions about our programs? We're here to help you start your career journey.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-blue-600" />
              Send us a Message
            </h2>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all resize-none`}
                    placeholder="How can we help you?"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
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
              <div className="text-center py-12 bg-green-50 rounded-xl border border-green-100">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">We'll get back to you shortly.</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <a
                    key={index}
                    href={action.action}
                    className={`group flex items-center p-4 rounded-xl border transition-all ${action.color} ${action.hoverColor} hover:shadow-sm`}
                  >
                    <div className="bg-white bg-opacity-60 p-3 rounded-lg mr-4">
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 text-gray-400 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Visit Us</h3>
                    <p className="text-gray-600 mt-1">
                      3rd Floor, Plot No. 705, Road No.36<br />
                      Jubilee Hills, Hyderabad 500033
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-6 h-6 text-gray-400 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Call Us</h3>
                    <p className="text-gray-600 mt-1">+91 91210 44435</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-gray-400 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email Us</h3>
                    <p className="text-gray-600 mt-1">info@sudaksha.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-gray-400 mr-4 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                    <p className="text-gray-600 mt-1">
                      Mon - Fri: 9:00 AM - 6:00 PM<br />
                      Sat - Sun: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Follow Us</h2>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors ${social.color}`}
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
      <div id="location" className="h-96 w-full relative bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Map Component Loading...</p>
            <a
              href="https://maps.google.com/?q=Jubilee+Hills,+Hyderabad+500033"
              target="_blank"
              className="text-blue-600 hover:underline text-sm mt-2 block"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
