'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  Plus,
  X,
  ArrowLeft,
  Trash2,
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

interface Module {
  title: string;
  duration: string;
  topics: string[] | string;
}

const AUDIENCE_TO_LEVEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'Beginner',
};

const LEVEL_TO_AUDIENCE: Record<string, string> = {
  Beginner: 'BEGINNER',
  Intermediate: 'INTERMEDIATE',
  Advanced: 'ADVANCED',
};

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [newTool, setNewTool] = useState('');

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
    status: 'DRAFT',
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (!courseRes.ok) throw new Error('Course not found');
        const courseJson = await courseRes.json();
        const c = courseJson.data;

        const deliveryMode = c.deliveryMode ?? 'ONLINE';
        const deliveryStr =
          deliveryMode === 'OFFLINE' ? 'Offline' : deliveryMode === 'HYBRID' ? 'Hybrid' : 'Online';

        setFormData({
          title: c.name ?? c.title ?? '',
          slug: c.slug ?? '',
          industryId: c.industry ?? '',
          trainingTypeId: c.courseType ?? '',
          shortDescription: c.shortDescription ?? '',
          fullDescription: c.description ?? '',
          durationHours: Number(c.durationHours ?? c.duration) ?? 40,
          durationWeeks: Number(c.durationWeeks) ?? 4,
          baseFee: Number(c.price) ?? 0,
          level: AUDIENCE_TO_LEVEL[c.audienceLevel] ?? 'Beginner',
          prerequisites: '',
          deliveryModes: c.deliveryMode ? [deliveryStr] : [],
          hasCapstoneProject: false,
          hasAssessments: true,
          hasAssignments: true,
          certificationType: 'Sudaksha Verified Certificate',
          targetAudiences: [],
          tools: [],
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          trainerId: c.trainerId ?? '',
          status: c.status ?? 'DRAFT',
        });

        const rawModules = c.moduleBreakdown;
        if (Array.isArray(rawModules) && rawModules.length > 0) {
          setModules(
            rawModules.map((m: any) => ({
              title: m.title ?? '',
              duration: typeof m.duration === 'string' ? m.duration : '',
              topics: Array.isArray(m.topics) ? m.topics.join(', ') : (m.topics ?? ''),
            }))
          );
        } else {
          setModules([{ title: '', duration: '', topics: '' }]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const updateModule = (index: number, field: string, value: string | string[]) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addModule = () => {
    setModules([...modules, { title: '', duration: '', topics: [] }]);
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
        (industries.find((i) => i.id === formData.industryId)?.name ?? formData.industryId) ||
        'Generic/All Industries';
      const trainingTypeName =
        (trainingTypes.find((t) => t.id === formData.trainingTypeId)?.name ?? formData.trainingTypeId) ||
        'TECHNOLOGY';
      const deliveryMode =
        formData.deliveryModes[0]?.toUpperCase() === 'OFFLINE'
          ? 'OFFLINE'
          : formData.deliveryModes[0]?.toUpperCase() === 'HYBRID'
            ? 'HYBRID'
            : 'ONLINE';

      const body = {
        name: formData.title,
        slug: (formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).replace(/[^a-z0-9-]/g, '') || 'course',
        description: formData.fullDescription || formData.shortDescription || 'Description',
        shortDescription: formData.shortDescription || '',
        duration: Number(formData.durationHours) || 40,
        price: Number(formData.baseFee) || 0,
        trainerId: formData.trainerId,
        audienceLevel: (LEVEL_TO_AUDIENCE[formData.level] || 'ALL_LEVELS') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS',
        status: formData.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SUSPENDED',
        industry: industryName,
        deliveryMode,
        category: 'Technology',
        categoryType: 'TECHNOLOGY',
        targetLevel: formData.level.toUpperCase().replace(/\s+/g, '_') || 'ALL_LEVELS',
        courseType: trainingTypeName,
      };

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Failed to update');

      setSuccess('Course updated successfully!');
      setTimeout(() => router.push('/admin/courses'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setSuccess('Course deleted!');
      setTimeout(() => router.push('/admin/courses'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/courses"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-gray-600">{formData.title || 'Course'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDeleteConfirm(true)}
          className="px-4 py-2.5 flex items-center gap-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="mb-6">
        <span
          className={`inline-block text-xs px-3 py-1.5 rounded-full font-medium ${
            formData.status === 'PUBLISHED'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {formData.status}
        </span>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Trainer *</label>
            <select
              value={formData.trainerId}
              onChange={(e) => handleInputChange('trainerId', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                value={formData.industryId}
                onChange={(e) => {
                  handleInputChange('industryId', e.target.value);
                  handleInputChange('trainingTypeId', '');
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
                {industries.length === 0 && (
                  <option value={formData.industryId}>{formData.industryId || 'Generic/All Industries'}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Training Type</label>
              <select
                value={formData.trainingTypeId}
                onChange={(e) => handleInputChange('trainingTypeId', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {trainingTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
                {trainingTypes.length === 0 && (
                  <option value={formData.trainingTypeId}>{formData.trainingTypeId || 'Technology'}</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.shortDescription.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => handleInputChange('fullDescription', e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold">Course Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
              <input
                type="number"
                value={formData.durationHours}
                onChange={(e) => handleInputChange('durationHours', parseInt(e.target.value, 10) || 0)}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weeks</label>
              <input
                type="number"
                value={formData.durationWeeks}
                onChange={(e) => handleInputChange('durationWeeks', parseInt(e.target.value, 10) || 0)}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fee (INR)</label>
              <input
                type="number"
                value={formData.baseFee}
                onChange={(e) => handleInputChange('baseFee', parseInt(e.target.value, 10) || 0)}
                min={0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Modes</label>
            <div className="flex gap-4">
              {['Online', 'Offline', 'Hybrid'].map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryModes.includes(mode)}
                    onChange={() => handleDeliveryModeToggle(mode)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Curriculum</h2>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={module.duration}
                      onChange={(e) => updateModule(idx, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <textarea
                      value={Array.isArray(module.topics) ? module.topics.join(', ') : module.topics}
                      onChange={(e) => updateModule(idx, 'topics', e.target.value)}
                      placeholder="Topics (comma-separated)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
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

        <div className="flex gap-3 pt-6 border-t">
          <Link
            href="/admin/courses"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </form>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Delete Course?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This cannot be undone. All related data will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
