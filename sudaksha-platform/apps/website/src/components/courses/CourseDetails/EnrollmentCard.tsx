'use client';

import { useState } from 'react';
import { Star, Clock, Users, Award, Calendar, BookOpen, CheckCircle, Heart, Phone, Mail, CreditCard, Shield, Download } from 'lucide-react';
import { Course } from '@/types/course';

interface EnrollmentCardProps {
  course: Course;
}

export function EnrollmentCard({ course }: EnrollmentCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const formatDuration = (duration: number) => {
    if (duration >= 40) {
      return `${Math.floor(duration / 40)} weeks`;
    }
    return `${duration} hours`;
  };

  const handleEnroll = () => {
    // Handle enrollment logic
    console.log('Enrolling in course:', course.id);
  };

  const handleCallback = () => {
    // Handle callback request
    console.log('Requesting callback for course:', course.id);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Price Section */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</div>
            <div className="text-lg text-gray-500 line-through">{formatPrice(course.price * 1.4)}</div>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            Save {formatPrice(course.price * 0.4)}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatDuration(course.duration)}</span>
          <span className="mx-2">•</span>
          <Award className="w-4 h-4 mr-1" />
          <span>{course.placementRate}% Placement</span>
        </div>
      </div>

      {/* Next Batch Info */}
      {course.batches && course.batches.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold mb-3">Next Batch Details</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Start: {formatDate(course.batches[0].startDate)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span>{course.batches[0].schedule}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              <span>{course.batches[0].maxStudents - course.batches[0].currentStudents} seats left</span>
            </div>
          </div>
        </div>
      )}

      {/* What's Included */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold mb-3">What's Included</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Live Interactive Sessions</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Recorded Lectures</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Hands-on Projects</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Placement Support</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Certificate of Completion</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span>Lifetime Access</span>
          </div>
        </div>
      </div>

      {/* Key Information */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold mb-3">Course Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Level:</span>
            <span className="font-medium">{course.audienceLevel.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Language:</span>
            <span className="font-medium">{course.language}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mode:</span>
            <span className="font-medium">{course.batches?.[0]?.mode || 'Online'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Certificate:</span>
            <span className="font-medium">{course.certification ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold mb-3">Payment Options</h4>
        <div className="space-y-3">
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pay in Full</span>
              <span className="text-sm font-semibold text-blue-600">{formatPrice(course.price)}</span>
            </div>
          </div>
          
          {course.hasEMI && (
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">EMI Available</span>
                <span className="text-sm font-semibold">From {formatPrice(course.price / 6)}/month</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-3 bg-gradient-to-br from-gray-50 to-white">
        <button
          onClick={handleEnroll}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Enroll Now
        </button>
        
        <button
          onClick={handleCallback}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
        >
          <Phone className="w-4 h-4 mr-2" />
          Request Callback
        </button>
        
        <button
          onClick={handleWishlist}
          className="w-full px-6 py-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
        >
          <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </button>
      </div>

      {/* Trust Signals */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-1 text-blue-600" />
            <span className="font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-1 text-blue-600" />
            <span className="font-medium">Money Back Guarantee</span>
          </div>
          <div className="flex items-center">
            <Download className="w-4 h-4 mr-1 text-blue-600" />
            <span className="font-medium">Certificate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentCard;
