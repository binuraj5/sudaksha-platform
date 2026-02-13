'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { CourseFormInput } from '@/lib/validation';

type TrainerOption = { id: string; name: string; email: string };

type CourseFormProps = {
  mode: 'add' | 'edit';
  initialData?: Partial<CourseFormInput> & { id?: string };
  trainers: TrainerOption[];
};

const AUDIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'] as const;
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED'] as const;
const DELIVERY_MODES = ['ONLINE', 'OFFLINE', 'HYBRID'] as const;

export default function CourseForm({ mode, initialData, trainers }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? '');
  const [duration, setDuration] = useState(initialData?.duration ?? 40);
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [trainerId, setTrainerId] = useState(initialData?.trainerId ?? '');
  const [audienceLevel, setAudienceLevel] = useState<string>(initialData?.audienceLevel ?? 'ALL_LEVELS');
  const [status, setStatus] = useState<string>(initialData?.status ?? 'DRAFT');
  const [industry, setIndustry] = useState(initialData?.industry ?? 'Generic/All Industries');
  const [deliveryMode, setDeliveryMode] = useState<string>(initialData?.deliveryMode ?? 'ONLINE');
  const [category, setCategory] = useState(initialData?.category ?? 'Technology');
  const [categoryType, setCategoryType] = useState(initialData?.categoryType ?? 'TECHNOLOGY');
  const [targetLevel, setTargetLevel] = useState(initialData?.targetLevel ?? 'ALL_LEVELS');
  const [courseType, setCourseType] = useState(initialData?.courseType ?? 'TECHNOLOGY');

  useEffect(() => {
    if (initialData?.name) setName(initialData.name);
    if (initialData?.slug) setSlug(initialData.slug);
    if (initialData?.description) setDescription(initialData.description);
    if (initialData?.shortDescription !== undefined) setShortDescription(initialData.shortDescription);
    if (initialData?.duration !== undefined) setDuration(initialData.duration);
    if (initialData?.price !== undefined) setPrice(initialData.price);
    if (initialData?.trainerId) setTrainerId(initialData.trainerId);
    if (initialData?.audienceLevel) setAudienceLevel(initialData.audienceLevel);
    if (initialData?.status) setStatus(initialData.status);
    if (initialData?.industry) setIndustry(initialData.industry);
    if (initialData?.deliveryMode) setDeliveryMode(initialData.deliveryMode);
    if (initialData?.category) setCategory(initialData.category);
    if (initialData?.categoryType) setCategoryType(initialData.categoryType);
    if (initialData?.targetLevel) setTargetLevel(initialData.targetLevel);
    if (initialData?.courseType) setCourseType(initialData.courseType);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: CourseFormInput = {
      name: name ?? '',
      slug: slug ?? '',
      description: description ?? '',
      shortDescription: shortDescription ?? '',
      duration: Number(duration),
      price: Number(price),
      trainerId: trainerId ?? '',
      audienceLevel: (audienceLevel ?? 'ALL_LEVELS') as CourseFormInput['audienceLevel'],
      status: (status ?? 'DRAFT') as CourseFormInput['status'],
      industry: industry ?? 'Generic/All Industries',
      deliveryMode: (deliveryMode ?? 'ONLINE') as CourseFormInput['deliveryMode'],
      category: category ?? 'Technology',
      categoryType: categoryType ?? 'TECHNOLOGY',
      targetLevel: targetLevel ?? 'ALL_LEVELS',
      courseType: courseType ?? 'TECHNOLOGY',
    };

    try {
      const url = mode === 'add' ? '/api/courses' : `/api/courses/${initialData?.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json?.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      router.push('/admin/courses');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'add' ? 'Add New Course' : 'Edit Course'}
        </h1>
        <p className="text-gray-500 text-sm">
          {mode === 'add'
            ? 'Create a new course. Slug must be unique and URL-friendly (lowercase, hyphens).'
            : 'Update course details.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Java Full Stack"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            required
            minLength={2}
            pattern="^[a-z0-9-]+$"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="e.g. java-full-stack"
          />
          <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers, hyphens only. Used in URL.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="One-line summary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full course description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours) *</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
              min={1}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              min={0}
              step={0.01}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary Trainer *</label>
          <select
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select trainer</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience Level</label>
            <select
              value={audienceLevel}
              onChange={(e) => setAudienceLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {AUDIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Generic/All Industries"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Mode</label>
            <select
              value={deliveryMode}
              onChange={(e) => setDeliveryMode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {DELIVERY_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Type</label>
            <input
              type="text"
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
            <input
              type="text"
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Level</label>
          <input
            type="text"
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Link
            href="/admin/courses"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'add' ? 'Create Course' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
