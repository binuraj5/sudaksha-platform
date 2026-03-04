'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
  ArrowLeft,
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  slug: string;
}

interface TrainingType {
  id: string;
  name: string;
  slug: string;
}

interface TrainerOption {
  id: string;
  name: string;
  email: string;
}

const LEVEL_TO_AUDIENCE: Record<string, string> = {
  Beginner: 'BEGINNER',
  Intermediate: 'INTERMEDIATE',
  Advanced: 'ADVANCED',
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modules, setModules] = useState([{ title: '', duration: '', topics: '' }]);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    industryId: '',
    trainingTypeId: '',
    shortDescription: '',
    fullDescription: '',
    durationHours: 40,
    durationWeeks: 4,
    baseFee: 5000,
    level: 'Beginner',
    prerequisites: '',
    deliveryModes: [] as string[],
    hasCapstoneProject: false,
    hasAssessments: true,
    hasAssignments: true,
    certificationType: 'Sudaksha Verified Certificate',
    targetAudiences: [] as string[],
    tools: [] as string[],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    trainerId: '',
  });

  const [newTool, setNewTool] = useState('');

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch('/api/admin/industries');
        const json = await res.json();
        setIndustries(Array.isArray(json?.data) ? json.data : []);
      } catch {
        setIndustries([]);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch('/api/trainers');
        const json = await res.json();
        setTrainers(Array.isArray(json?.data) ? json.data : []);
      } catch {
        setTrainers([]);
      }
    };
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (!formData.industryId) {
      setTrainingTypes([]);
      return;
    }
    const fetchTypes = async () => {
      try {
        const res = await fetch(
          `/api/admin/training-types?industry=${encodeURIComponent(formData.industryId)}`
        );
        const json = await res.json();
        setTrainingTypes(Array.isArray(json?.data) ? json.data : []);
      } catch {
        setTrainingTypes([]);
      }
    };
    fetchTypes();
  }, [formData.industryId]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'title' && typeof value === 'string' && { slug: generateSlug(value) }),
    }));
  };

  const handleDeliveryModeToggle = (mode: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryModes: prev.deliveryModes.includes(mode)
        ? prev.deliveryModes.filter((m) => m !== mode)
        : [...prev.deliveryModes, mode],
    }));
  };

  const handleAudienceToggle = (audience: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudiences: prev.targetAudiences.includes(audience)
        ? prev.targetAudiences.filter((a) => a !== audience)
        : [...prev.targetAudiences, audience],
    }));
  };

  const addTool = () => {
    if (newTool.trim()) {
      setFormData((prev) => ({ ...prev, tools: [...prev.tools, newTool.trim()] }));
      setNewTool('');
    }
  };

  const removeTool = (index: number) => {
    setFormData((prev) => ({ ...prev, tools: prev.tools.filter((_, i) => i !== index) }));
  };

  const updateModule = (index: number, field: string, value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { title: '', duration: '', topics: '' }]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const industryName =
        industries.find((i) => i.id === formData.industryId)?.name ||
        formData.industryId ||
        'Generic/All Industries';
      const trainingTypeName =
        trainingTypes.find((t) => t.id === formData.trainingTypeId)?.name ||
        formData.trainingTypeId ||
        'TECHNOLOGY';
      const deliveryMode =
        formData.deliveryModes[0]?.toUpperCase() === 'OFFLINE'
          ? 'OFFLINE'
          : formData.deliveryModes[0]?.toUpperCase() === 'HYBRID'
            ? 'HYBRID'
            : 'ONLINE';

      const body = {
        name: formData.title,
        slug: (formData.slug || generateSlug(formData.title)).replace(/[^a-z0-9-]/g, '') || 'course',
        description: formData.fullDescription || formData.shortDescription || 'Description',
        shortDescription: formData.shortDescription || '',
        duration: Number(formData.durationHours) || 40,
        price: Number(formData.baseFee) || 0,
        trainerId: formData.trainerId,
        audienceLevel: (LEVEL_TO_AUDIENCE[formData.level] || 'ALL_LEVELS') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS',
        status: 'DRAFT' as const,
        industry: industryName,
        deliveryMode,
        category: 'Technology',
        categoryType: 'TECHNOLOGY',
        targetLevel: formData.level.toUpperCase().replace(/\s+/g, '_') || 'ALL_LEVELS',
        courseType: trainingTypeName,
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create course');
      }

      setSuccess('Course created successfully!');
      setTimeout(
        () => router.push(`/admin/courses/${data.data?.id ?? data.data?.id}`),
        1500
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/courses"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
          <p className="text-gray-600">Add a new course to your catalog</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          {/* Trainer (required by API) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Trainer *</label>
            <select
              value={formData.trainerId}
              onChange={(e) => handleInputChange('trainerId', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
              <select
                value={formData.industryId}
                onChange={(e) => {
                  handleInputChange('industryId', e.target.value);
                  handleInputChange('trainingTypeId', '');
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select an industry</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
                {industries.length === 0 && (
                  <option value="Generic/All Industries">Generic/All Industries</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Training Type *</label>
              <select
                value={formData.trainingTypeId}
                onChange={(e) => handleInputChange('trainingTypeId', e.target.value)}
                disabled={!formData.industryId && industries.length > 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
              >
                <option value="">Select a training type</option>
                {trainingTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
                {trainingTypes.length === 0 && (
                  <option value="TECHNOLOGY">Technology</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              placeholder="e.g., Advanced Python Programming"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug (auto-generated)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="auto-generated from title"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              required
              placeholder="Brief description (will appear in course list)"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/500 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              required
              placeholder="Detailed course description"
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours) *</label>
              <input
                type="number"
                value={formData.durationHours}
                onChange={(e) => handleInputChange('durationHours', parseInt(e.target.value, 10) || 0)}
                min={1}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Weeks) *</label>
              <input
                type="number"
                value={formData.durationWeeks}
                onChange={(e) => handleInputChange('durationWeeks', parseInt(e.target.value, 10) || 0)}
                min={1}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Fee (INR) *</label>
              <input
                type="number"
                value={formData.baseFee}
                onChange={(e) => handleInputChange('baseFee', parseInt(e.target.value, 10) || 0)}
                min={0}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
            <select
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Modes *</label>
            <div className="flex gap-4">
              {['Online', 'Offline', 'Hybrid'].map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryModes.includes(mode)}
                    onChange={() => handleDeliveryModeToggle(mode)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Curriculum</h2>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-primary text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(idx, 'title', e.target.value)}
                      placeholder="Module title"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={module.duration}
                      onChange={(e) => updateModule(idx, 'duration', e.target.value)}
                      placeholder="Duration (e.g., 8 hours)"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <textarea
                      value={module.topics}
                      onChange={(e) => updateModule(idx, 'topics', e.target.value)}
                      placeholder="Topics (comma-separated)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(idx)}
                      className="ml-4 p-1 hover:bg-red-50 rounded text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Technologies & Tools</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTool();
                }
              }}
              placeholder="Add a tool (e.g., Python, Django)"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={addTool}
              className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {formData.tools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tools.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(idx)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Target Audiences</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              'B2B National',
              'B2B International',
              'B2B Institutional',
              'B2C Freshers',
              'B2C Professionals',
            ].map((audience) => (
              <label key={audience} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.targetAudiences.includes(audience)}
                  onChange={() => handleAudienceToggle(audience)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{audience}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">SEO Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              placeholder="SEO title (50-60 characters)"
              maxLength={60}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              placeholder="SEO description (150-160 characters)"
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Link
            href="/admin/courses"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-900 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.title || !formData.trainerId}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Course...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
