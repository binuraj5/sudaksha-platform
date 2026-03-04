'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, Zap } from 'lucide-react';

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

interface GeneratedContent {
  title: string;
  shortDescription: string;
  fullDescription: string;
  durationHours: number;
  durationWeeks: number;
  baseFee: number;
  curriculum: { modules: Array<{ title: string; duration: string }> };
}

export default function AIGeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedData, setGeneratedData] = useState<{
    preview: GeneratedContent;
    industry: Industry;
    trainingType: TrainingType;
  } | null>(null);

  const [formData, setFormData] = useState({
    industry: '',
    trainingType: '',
    courseTitle: '',
    targetAudiences: [] as string[],
    deliveryModes: [] as string[],
    desiredDurationWeeks: 4,
    additionalContext: '',
  });

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
    if (!formData.industry) {
      setTrainingTypes([]);
      return;
    }
    const fetchTypes = async () => {
      try {
        const res = await fetch(
          `/api/admin/training-types?industry=${encodeURIComponent(formData.industry)}`
        );
        const json = await res.json();
        setTrainingTypes(Array.isArray(json?.data) ? json.data : []);
      } catch {
        setTrainingTypes([]);
      }
    };
    fetchTypes();
  }, [formData.industry]);

  const handleInputChange = (
    field: string,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAudienceToggle = (audience: string) => {
    setFormData((prev) => ({
      ...prev,
      targetAudiences: prev.targetAudiences.includes(audience)
        ? prev.targetAudiences.filter((a) => a !== audience)
        : [...prev.targetAudiences, audience],
    }));
  };

  const handleModeToggle = (mode: string) => {
    setFormData((prev) => ({
      ...prev,
      deliveryModes: prev.deliveryModes.includes(mode)
        ? prev.deliveryModes.filter((m) => m !== mode)
        : [...prev.deliveryModes, mode],
    }));
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);

    try {
      const response = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Generation failed');
      }

      setGeneratedData(data.data);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. API /api/courses/generate may not be implemented.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedData) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/courses/generate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatedContent: generatedData.preview,
          industryId: generatedData.industry.id,
          trainingTypeId: generatedData.trainingType.id,
          slug: generatedData.preview.title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Publishing failed');
      }

      setSuccess('Course published successfully!');
      setTimeout(() => router.push('/admin/courses'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Zap className="w-8 h-8 text-orange-500" />
          AI Course Generator
        </h1>
        <p className="text-gray-600 mt-2">
          Create courses automatically using artificial intelligence
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {num}
            </div>
            {num < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${step > num ? 'bg-primary' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between mb-8 text-sm font-medium text-gray-600">
        <span>Course Details</span>
        <span>Preview</span>
        <span>Publish</span>
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

      {step === 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
            <select
              value={formData.industry}
              onChange={(e) => {
                handleInputChange('industry', e.target.value);
                handleInputChange('trainingType', '');
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select an industry</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Type *</label>
            <select
              value={formData.trainingType}
              onChange={(e) => handleInputChange('trainingType', e.target.value)}
              disabled={!formData.industry}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
            >
              <option value="">Select a training type</option>
              {trainingTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
            <input
              type="text"
              value={formData.courseTitle}
              onChange={(e) => handleInputChange('courseTitle', e.target.value)}
              placeholder="e.g., Advanced Python Programming"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desired Duration (weeks) *</label>
            <input
              type="number"
              value={formData.desiredDurationWeeks}
              onChange={(e) =>
                handleInputChange('desiredDurationWeeks', parseInt(e.target.value, 10) || 4)
              }
              min={1}
              max={52}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Audiences *</label>
            <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Modes *</label>
            <div className="grid grid-cols-3 gap-3">
              {['Online', 'Offline', 'Hybrid'].map((mode) => (
                <label key={mode} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryModes.includes(mode)}
                    onChange={() => handleModeToggle(mode)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context</label>
            <textarea
              value={formData.additionalContext}
              onChange={(e) => handleInputChange('additionalContext', e.target.value)}
              placeholder="Any specific requirements or focus areas..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              generating ||
              !formData.industry ||
              !formData.trainingType ||
              !formData.courseTitle ||
              formData.targetAudiences.length === 0 ||
              formData.deliveryModes.length === 0
            }
            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Course...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </button>
        </div>
      )}

      {step === 2 && generatedData && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              AI has generated your course. Review the content below and publish when ready.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {generatedData.preview.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {generatedData.preview.shortDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">
                  {generatedData.preview.durationWeeks}w ({generatedData.preview.durationHours}h)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Base Fee</p>
                <p className="font-semibold text-gray-900">
                  ₹{generatedData.preview.baseFee?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">Full Description</p>
              <p className="text-sm text-gray-700 line-clamp-5">
                {generatedData.preview.fullDescription}
              </p>
            </div>

            {generatedData.preview.curriculum?.modules?.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">
                  Modules ({generatedData.preview.curriculum.modules.length})
                </p>
                <div className="space-y-2">
                  {generatedData.preview.curriculum.modules.map(
                    (module: { title: string; duration: string }, idx: number) => (
                      <div
                        key={idx}
                        className="text-sm p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        <p className="font-medium text-gray-900">{module.title}</p>
                        <p className="text-xs text-gray-600">{module.duration}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Publishing...' : 'Publish Course'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
