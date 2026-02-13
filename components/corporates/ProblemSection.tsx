'use client';

import { Target, Users, Award, Zap } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            The Traditional Corporate Training Problem
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Why most corporate training fails to deliver real business value
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Column 1: Off-the-Shelf Training */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              OFF-THE-SHELF TRAINING
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Generic content that doesn't match your tech stack
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                One-size-fits-all approach
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                No alignment with business objectives
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Attendance-based success metrics
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Minimal post-training impact
              </li>
            </ul>
          </div>

          {/* Column 2: In-House Training */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              IN-HOUSE TRAINING
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Senior developers pulled from productive work
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Inconsistent quality and methodology
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                No standardized curriculum
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Limited scalability
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                Hidden costs in productivity loss
              </li>
            </ul>
          </div>

          {/* Column 3: Traditional Vendors */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              TRADITIONAL VENDORS
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Certification-focused, not outcome-focused
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Lecturers without recent industry experience
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                No customization for your needs
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Zero post-training accountability
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Disconnect between training and performance
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Statement */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <p className="text-xl text-red-900 font-semibold leading-relaxed">
            The result? <span className="text-2xl">Thousands spent on training.</span> 
            <br />
            <span className="text-2xl">Minimal impact on productivity.</span> 
            <br />
            Skills that don't translate to your actual work environment.
          </p>
        </div>
      </div>
    </section>
  );
}
