'use client';

import { ArrowRight, Download, Users, TrendingUp } from 'lucide-react';
import { CTAButton } from '@/components/universal/CTAButton';

export default function CorporateHero() {

  return (
    <>
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center mb-16">
            {/* Eyebrow */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              CORPORATE TRAINING SOLUTIONS
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Don't Just Train Employees.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Solve Business Problems.
              </span>
            </h1>

            {/* Subheadline */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Outcome-driven, precision-curated training that transforms your workforce into a strategic asset. 
              Not off-the-shelf. Not generic. Purpose-built for your tech stack and business goals.
            </h2>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <CTAButton 
                variant="custom"
                className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Hero', ctaLabel: 'Schedule Strategy Session', audienceType: 'corporate', intent: 'schedule_call' }}
              >
                Schedule Strategy Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </CTAButton>
              <CTAButton 
                variant="custom"
                className="inline-flex justify-center items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20"
                ctx={{ page: 'Corporates', pageUrl: '/corporates', section: 'Hero', ctaLabel: 'Download Corporate Brochure', audienceType: 'corporate', intent: 'download_brochure' }}
              >
                <Download className="mr-2 w-5 h-5" />
                Download Corporate Brochure
              </CTAButton>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Corporate Team */}
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-600/20 to-orange-600/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-center mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-center">Collaborative Excellence</h3>
                <p className="text-gray-300 text-center">
                  Teams working together on real-world challenges, building solutions that drive business value
                </p>
              </div>
            </div>

            {/* Right Side - Performance Metrics */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Productivity</span>
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-2xl font-bold text-green-400">+40%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Code Quality</span>
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-2xl font-bold text-blue-400">+65%</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Deployment Speed</span>
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-2xl font-bold text-purple-400">+3x</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-6 text-center">Measurable Impact</h3>
                <p className="text-gray-300 text-center">
                  Real-time metrics showing the tangible business impact of our training programs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Banner */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-gray-300">Trusted by <strong className="text-white">200+</strong> Enterprises</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-gray-300"><strong className="text-white">50,000+</strong> Employees Trained</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span className="text-gray-300"><strong className="text-white">92%</strong> Client Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
