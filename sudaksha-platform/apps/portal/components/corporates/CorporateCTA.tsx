'use client';

import { Calendar, FileText, Phone, HelpCircle } from 'lucide-react';

export default function CorporateCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Let's discuss your specific challenges and design a solution that delivers measurable results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1: Schedule Strategy Session */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Calendar className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-3">Schedule Strategy Session</h3>
            <p className="mb-4 opacity-90">
              45-minute consultation with our corporate training experts
            </p>
            <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Book Your Session
            </button>
            <p className="text-sm mt-2 opacity-75">
              No obligation. No sales pitch. Just solutions.
            </p>
          </div>

          {/* Card 2: Get Custom Proposal */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <FileText className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-3">Get Custom Proposal</h3>
            <p className="mb-4 opacity-90">
              Tell us about your needs and get a tailored proposal within 48 hours
            </p>
            <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Request Proposal
            </button>
            <p className="text-sm mt-2 opacity-75">
              Includes curriculum outline and pricing
            </p>
          </div>

          {/* Card 3: Talk to Us Now */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <Phone className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-3">Talk to Us Now</h3>
            <p className="mb-4 opacity-90">
              Speak with our corporate team right away
            </p>
            <div className="space-y-2 mb-4">
              <p className="font-semibold">+91-XXXXX-XXXXX</p>
              <p className="font-semibold">corporate@sudaksha.com</p>
            </div>
            <p className="text-sm opacity-75">
              Mon-Fri, 9 AM - 6 PM IST
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
