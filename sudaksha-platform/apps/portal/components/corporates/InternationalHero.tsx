'use client';

import { useState } from 'react';
import { ArrowRight, Download, Globe, Users, TrendingUp, Target, Zap, Award, MapPin } from 'lucide-react';

export default function InternationalHero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    { id: 'africa', name: 'Africa', color: 'bg-blue-600', projects: 18, highlight: 'deep' },
    { id: 'mena', name: 'MENA', color: 'bg-blue-500', projects: 8, highlight: 'medium' },
    { id: 'latam', name: 'Latin America', color: 'bg-blue-400', projects: 3, highlight: 'light' },
    { id: 'asia', name: 'Southeast Asia', color: 'bg-blue-400', projects: 2, highlight: 'light' }
  ];

  const keyHighlights = [
    { icon: Globe, text: '15+ Countries', subtext: 'Active presence across Africa, MENA, Latin America' },
    { icon: Users, text: '5,000+ Professionals Trained', subtext: 'Government officials, bankers, engineers, developers' },
    { icon: Target, text: '30+ Projects Delivered', subtext: 'E-governance, digital banking, smart cities, capacity building' },
    { icon: MapPin, text: '3 Regional Hubs', subtext: 'East Africa, West Africa, Singapore' }
  ];

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
              <Globe className="w-4 h-4 mr-2" />
              INTERNATIONAL B2B SOLUTIONS
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              Building Global Digital Capability
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                from India to the World
              </span>
            </h1>

            {/* Subheadline */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-8 max-w-5xl mx-auto">
              Partnering with governments, enterprises, and NGOs across Africa, MENA, and Latin America to build sustainable digital capability through training, technology transfer, and innovative delivery models like African Capability Centers (ACC) and Build-Operate-Transfer (BOT).
            </h2>

            {/* Key Highlights */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
              {keyHighlights.map((highlight, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <highlight.icon className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
                  <div className="text-2xl font-bold text-white mb-2">{highlight.text}</div>
                  <div className="text-sm text-gray-300">{highlight.subtext}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Explore Our Africa Presence
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20">
                <Target className="mr-2 w-5 h-5" />
                View Project Showcase
              </button>
            </div>
          </div>

          {/* Hero Visual - Interactive World Map */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-center mb-8">Our Global Presence</h3>
            
            {/* Simplified World Map Representation */}
            <div className="relative max-w-4xl mx-auto">
              {/* Map Container */}
              <div className="bg-gradient-to-b from-blue-800/20 to-blue-900/20 rounded-xl p-8 border border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id === selectedRegion ? null : region.id)}
                      className={`relative p-6 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        selectedRegion === region.id 
                          ? 'bg-blue-600/30 border-2 border-blue-400 shadow-lg' 
                          : 'bg-white/10 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <div className={`w-full h-3 rounded-full mb-3 ${region.color}`}></div>
                      <div className="text-lg font-semibold text-white">{region.name}</div>
                      <div className="text-sm text-gray-300 mt-1">{region.projects} Projects</div>
                      {selectedRegion === region.id && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {selectedRegion && (
                  <div className="mt-6 p-4 bg-blue-600/20 rounded-lg border border-blue-400/30">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-300 mb-2">
                        {regions.find(r => r.id === selectedRegion)?.name}
                      </div>
                      <div className="text-sm text-gray-300">
                        Click to explore {regions.find(r => r.id === selectedRegion)?.projects} projects in this region
                      </div>
                    </div>
                  </div>
                )}
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
                <span className="text-gray-300">Trusted by <strong className="text-white">8</strong> African Governments</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-gray-300"><strong className="text-white">25+</strong> Banks & Financial Institutions</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span className="text-gray-300"><strong className="text-white">15+</strong> International NGOs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Explore Africa Presence</h3>
            <p className="text-gray-600 mb-6">Learn more about our projects and impact across African countries.</p>
            {/* Contact form will be implemented here */}
            <div className="space-y-4">
              <input type="text" placeholder="Organization Name" className="w-full px-4 py-2 border rounded-lg" />
              <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border rounded-lg" />
              <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" />
              <input type="tel" placeholder="Phone" className="w-full px-4 py-2 border rounded-lg" />
              <textarea placeholder="Tell us about your interest in African markets" rows={3} className="w-full px-4 py-2 border rounded-lg"></textarea>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
