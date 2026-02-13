'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, X, Plus, Trash2, Eye, Upload, Image as ImageIcon,
  BookOpen, Target, Award, Users, Clock, DollarSign,
  Globe, Briefcase, Star, CheckCircle, AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  duration: number;
  price: number;
  rating: number;
  enrolledCount: number;
  industry: string;
  targetLevel: string;
  courseType: string;
  deliveryMode: string;
  isPopular: boolean;
  isNew: boolean;
  hasPlacementSupport: boolean;
  hasEMI: boolean;
  skillTags: string[];
  learningObjectives: string[];
  prerequisites?: string;
  objectives?: string;
  curriculum?: string;
  status: string;
  imageUrl?: string;
  slug: string;
}

interface CourseEditorProps {
  course?: Course;
  onSave: (course: Partial<Course>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

const CATEGORIES = [
  'SOFTWARE_DEVELOPMENT',
  'BUSINESS_ANALYSIS', 
  'DATA_SCIENCE',
  'CLOUD_COMPUTING',
  'CYBERSECURITY',
  'UI_UX_DESIGN',
  'DIGITAL_MARKETING',
  'PROJECT_MANAGEMENT'
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Sales'
];

const LEVELS = [
  'BEGINNER',
  'INTERMEDIATE', 
  'ADVANCED',
  'EXPERT'
];

const COURSE_TYPES = [
  'TECHNOLOGY',
  'FUNCTIONAL',
  'MANAGEMENT',
  'DESIGN'
];

const DELIVERY_MODES = [
  'ONLINE',
  'OFFLINE',
  'HYBRID'
];

const STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'INACTIVE'
];

export default function CourseEditor({ course, onSave, onCancel, mode }: CourseEditorProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '',
    description: '',
    shortDescription: '',
    category: 'SOFTWARE_DEVELOPMENT',
    duration: 12,
    price: 45000,
    industry: 'Technology',
    targetLevel: 'BEGINNER',
    courseType: 'TECHNOLOGY',
    deliveryMode: 'ONLINE',
    isPopular: false,
    isNew: false,
    hasPlacementSupport: false,
    hasEMI: false,
    skillTags: [],
    learningObjectives: [],
    prerequisites: '',
    objectives: '',
    curriculum: '',
    status: 'DRAFT',
    imageUrl: '',
    ...course
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addArrayItem = (field: 'skillTags' | 'learningObjectives', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'skillTags' | 'learningObjectives', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.targetLevel) {
      newErrors.targetLevel = 'Target level is required';
    }

    if (!formData.courseType) {
      newErrors.courseType = 'Course type is required';
    }

    if (!formData.deliveryMode) {
      newErrors.deliveryMode = 'Delivery mode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving course:', error);
      setErrors({ submit: 'Failed to save course. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service
      // For now, just create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (previewMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Course Preview</h2>
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            {/* Preview content would go here */}
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Preview</h3>
              <p className="text-gray-600 mb-6">This is how your course will appear to students</p>
              
              <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
                <h4 className="font-bold text-lg mb-4">{formData.name}</h4>
                <p className="text-gray-600 mb-4">{formData.shortDescription}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Category:</strong> {formData.category}</div>
                  <div><strong>Duration:</strong> {formData.duration} weeks</div>
                  <div><strong>Price:</strong> ₹{formData.price?.toLocaleString('en-IN')}</div>
                  <div><strong>Level:</strong> {formData.targetLevel}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Course' : 'Edit Course'}
            </h2>
            <p className="text-gray-600 mt-1">
              {mode === 'create' ? 'Fill in the details to create a new course' : 'Update course information'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Preview"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800">{errors.submit}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter course name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={formData.shortDescription || ''}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description (appears in course listings)"
                  />
                  {errors.shortDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.shortDescription}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Detailed course description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Image
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={formData.imageUrl}
                          alt="Course preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Course Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.industry || ''}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.industry ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {INDUSTRIES.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    {errors.industry && (
                      <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Level *
                    </label>
                    <select
                      value={formData.targetLevel || ''}
                      onChange={(e) => handleChange('targetLevel', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.targetLevel ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.targetLevel && (
                      <p className="mt-1 text-sm text-red-600">{errors.targetLevel}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Type *
                    </label>
                    <select
                      value={formData.courseType || ''}
                      onChange={(e) => handleChange('courseType', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.courseType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {COURSE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.courseType && (
                      <p className="mt-1 text-sm text-red-600">{errors.courseType}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Mode *
                    </label>
                    <select
                      value={formData.deliveryMode || ''}
                      onChange={(e) => handleChange('deliveryMode', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.deliveryMode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {DELIVERY_MODES.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                    {errors.deliveryMode && (
                      <p className="mt-1 text-sm text-red-600">{errors.deliveryMode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status || 'DRAFT'}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (weeks) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration || ''}
                      onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12"
                      min="1"
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="45000"
                      min="0"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Skills & Learning */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Skills & Learning
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a skill..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('skillTags', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement;
                          if (input) {
                            addArrayItem('skillTags', input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(formData.skillTags || []).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeArrayItem('skillTags', index)}
                            className="hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a learning objective..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addArrayItem('learningObjectives', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add a learning objective..."]') as HTMLInputElement;
                          if (input) {
                            addArrayItem('learningObjectives', input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.learningObjectives || []).map((objective, index) => (
                        <div
                          key={index}
                          className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-green-800 flex-1">{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('learningObjectives', index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-600" />
                Additional Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prerequisites
                  </label>
                  <textarea
                    value={formData.prerequisites || ''}
                    onChange={(e) => handleChange('prerequisites', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What students should know before taking this course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Objectives
                  </label>
                  <textarea
                    value={formData.objectives || ''}
                    onChange={(e) => handleChange('objectives', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What students will achieve after completing this course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curriculum
                  </label>
                  <textarea
                    value={formData.curriculum || ''}
                    onChange={(e) => handleChange('curriculum', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Course curriculum and weekly breakdown"
                  />
                </div>
              </div>
            </div>

            {/* Special Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Special Features
              </h3>
              
              <div className="space-y-3">
                {[
                  { key: 'isPopular', label: 'Most Popular Course', icon: '🔥' },
                  { key: 'isNew', label: 'New Course', icon: '✨' },
                  { key: 'hasPlacementSupport', label: 'Placement Support', icon: '🎯' },
                  { key: 'hasEMI', label: 'EMI Available', icon: '💳' }
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[feature.key as keyof Course] as boolean || false}
                      onChange={(e) => handleChange(feature.key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-gray-700 font-medium">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {mode === 'create' ? 'Create Course' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
