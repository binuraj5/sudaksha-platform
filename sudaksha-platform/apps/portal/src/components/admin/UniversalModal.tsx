'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Users, Calendar, DollarSign, Eye, Download } from 'lucide-react';

interface ModalField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date';
  value: string | number;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
}

interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ADD_COURSE' | 'EDIT_TRAINER' | 'CREATE_BATCH' | 'EDIT_STUDENT' | 'VIEW_STUDENT' | 'DELETE_CONFIRM';
  title: string;
  data?: any;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export default function UniversalModal({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  data, 
  onSubmit, 
  isLoading = false 
}: UniversalModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data && type !== 'DELETE_CONFIRM') {
      setFormData(data);
    }
  }, [data, type]);

  const getModalContent = () => {
    switch (type) {
      case 'ADD_COURSE':
        return (
          <div className="space-y-6">
            {[
              { name: 'name', label: 'Course Name', type: 'text', required: true },
              { name: 'category', label: 'Category', type: 'select', required: true, 
                options: [
                  { label: 'Software Development', value: 'software_development' },
                  { label: 'Data Science', value: 'data_science' },
                  { label: 'Cloud Computing', value: 'cloud_computing' },
                  { label: 'Business', value: 'business' }
                ]
              },
              { name: 'duration', label: 'Duration (weeks)', type: 'number', required: true },
              { name: 'price', label: 'Price (₹)', type: 'number', required: true },
              { name: 'description', label: 'Description', type: 'textarea', required: true }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'EDIT_TRAINER':
        return (
          <div className="space-y-6">
            {[
              { name: 'name', label: 'Full Name', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'phone', label: 'Phone', type: 'text' },
              { name: 'expertise', label: 'Expertise', type: 'textarea' },
              { name: 'experience', label: 'Experience (years)', type: 'number' },
              { name: 'bio', label: 'Bio', type: 'textarea' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        );

      case 'CREATE_BATCH':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'courseId', label: 'Course', type: 'select', required: true,
                  options: [
                    { label: 'MERN Stack Development', value: '1' },
                    { label: 'Java Spring Boot', value: '2' },
                    { label: 'Data Science', value: '3' }
                  ]
                },
                { name: 'trainerId', label: 'Trainer', type: 'select', required: true,
                  options: [
                    { label: 'John Doe', value: '1' },
                    { label: 'Jane Smith', value: '2' },
                    { label: 'Mike Johnson', value: '3' }
                  ]
                }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              {[
                { name: 'name', label: 'Batch Name', type: 'text', required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'endDate', label: 'End Date', type: 'date', required: true },
                { name: 'maxStudents', label: 'Max Students', type: 'number', required: true },
                { name: 'schedule', label: 'Schedule', type: 'select', required: true,
                  options: [
                    { label: 'Weekday Mornings (9AM-1PM)', value: 'weekday_morning' },
                    { label: 'Weekday Evenings (6PM-9PM)', value: 'weekday_evening' },
                    { label: 'Weekend Full Day', value: 'weekend_full' },
                    { label: 'Online Flexible', value: 'online_flexible' }
                  ]
                }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'DELETE_CONFIRM':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="text-sm text-gray-500 mb-6">
              {data?.name || data?.title || 'this item'}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onSubmit) onSubmit(data);
                  onClose();
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
            {data && (
              <div className="text-left space-y-4 bg-gray-50 p-6 rounded-lg">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium text-gray-700 capitalize">{key}:</span>
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        );
    }
  };

  const handleSubmit = () => {
    if (onSubmit && formData) {
      onSubmit(formData);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Processing...</p>
                </div>
              ) : (
                getModalContent()
              )}
            </div>

            {/* Footer */}
            {type !== 'DELETE_CONFIRM' && type !== 'VIEW_STUDENT' && (
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  {type === 'ADD_COURSE' && <Plus className="w-4 h-4" />}
                  {type === 'EDIT_TRAINER' && <Edit className="w-4 h-4" />}
                  {type === 'CREATE_BATCH' && <Plus className="w-4 h-4" />}
                  <span>
                    {type === 'ADD_COURSE' && 'Create Course'}
                    {type === 'EDIT_TRAINER' && 'Update Trainer'}
                    {type === 'CREATE_BATCH' && 'Create Batch'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
