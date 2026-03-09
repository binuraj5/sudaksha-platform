'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save, Plus, X, Upload, Loader2, BookOpen, Users, Award, Clock, Check
} from 'lucide-react';

import { CreateCourseSchema } from '@/lib/schemas/course';

type CreateFormData = z.infer<typeof CreateCourseSchema>;

const modes = ['Live Online', 'Offline', 'Hybrid'];
const statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

// Load master data items by type from the JSON file store API
async function fetchMasterItems(type: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/admin/master-data?type=${type}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data.map((i: any) => i.name);
  } catch {}
  return [];
}

interface AdminCourseFormProps {
  course?: any;
  onSave: (courseData: Partial<any>) => Promise<void>;
  mode: 'create' | 'edit';
}

// Normalize learningObjectives to [{outcome: string}] (matches Zod schema)
function normalizeLearningObjectives(raw: any[]): { outcome: string }[] {
  if (!raw?.length) return [{ outcome: '' }, { outcome: '' }, { outcome: '' }];
  return raw.map(item =>
    typeof item === 'string' ? { outcome: item } : { outcome: item?.outcome ?? '' }
  );
}

export default function AdminCourseForm({ course, onSave, mode }: AdminCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master data dropdowns — loaded from /api/admin/master-data
  const [mdCategories, setMdCategories] = useState<string[]>([]);
  const [mdDomains, setMdDomains] = useState<string[]>(['IT', 'Non-IT', 'All']);
  const [mdIndustries, setMdIndustries] = useState<string[]>([]);
  const [mdLevels, setMdLevels] = useState<string[]>([]);
  const [mdCourseTypes, setMdCourseTypes] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetchMasterItems('category'),
      fetchMasterItems('domain'),
      fetchMasterItems('industry'),
      fetchMasterItems('level'),
      fetchMasterItems('courseType'),
    ]).then(([cats, doms, inds, lvls, types]) => {
      if (cats.length) setMdCategories(cats);
      if (doms.length) setMdDomains(doms);
      if (inds.length) setMdIndustries(inds);
      if (lvls.length) setMdLevels(lvls);
      if (types.length) setMdCourseTypes(types);
    });
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting: formIsSubmitting }
  } = useForm<CreateFormData>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
      name: course?.name || '',
      slug: course?.slug || '',
      category: course?.category || '',
      domain: course?.domain || 'IT',
      industry: course?.industry || 'Technology',
      targetLevel: course?.targetLevel || 'Beginner',
      courseType: course?.courseType || 'Technology',
      deliveryMode: course?.deliveryMode || 'Live Online',
      status: course?.status || 'DRAFT',
      durationHours: course?.durationHours || 120,
      price: course?.price || 0,
      description: course?.description || '',
      prerequisites: course?.prerequisites || '',
      learningObjectives: normalizeLearningObjectives(course?.learningObjectives) as any,
      specialFeatures: course?.specialFeatures || [],
      curriculum: course?.curriculum || course?.modules || [
        {
          title: 'Module 1: Introduction',
          description: 'Introduction to the course',
          duration: 20,
          chapters: [
            { title: 'Course Overview', description: 'Overview of the course', duration: 2 },
            { title: 'Getting Started', description: 'Setup and prerequisites', duration: 3 }
          ]
        }
      ]
    }
  });

  const {
    fields: learningObjectiveFields,
    append: appendLearningObjective,
    remove: removeLearningObjective
  } = useFieldArray({
    control,
    name: 'learningObjectives' as any
  });

  const {
    fields: curriculumFields,
    append: appendCurriculum,
    remove: removeCurriculum
  } = useFieldArray({
    control,
    name: 'curriculum'
  });

  // Auto-compute total durationHours from sum of all chapter durations
  const curriculumWatch = watch('curriculum');
  useEffect(() => {
    const total = (curriculumWatch ?? []).reduce((sum: number, mod: any) => {
      const chapSum = (mod?.chapters ?? []).reduce(
        (s: number, ch: any) => s + (parseFloat(ch?.duration) || 0), 0
      );
      return sum + chapSum;
    }, 0);
    if (total > 0) {
      setValue('durationHours', Math.round(total * 100) / 100);
    }
  }, [curriculumWatch, setValue]);

  useEffect(() => {
    if (course && mode === 'edit') {
      reset({
        name: course.name,
        slug: course.slug,
        category: course.category,
        domain: course.domain,
        industry: course.industry,
        targetLevel: course.targetLevel,
        courseType: course.courseType,
        deliveryMode: course.deliveryMode,
        durationHours: course.durationHours,
        price: course.price,
        status: course.status,
        description: course.description,
        prerequisites: course.prerequisites,
        learningObjectives: normalizeLearningObjectives(course.learningObjectives) as any,
        specialFeatures: course.specialFeatures,
        curriculum: course.curriculum || course.modules || []
      });
    }
  }, [course, mode, reset]);

  const onSubmit = async (data: CreateFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error saving course:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const addModule = () => {
    appendCurriculum({
      title: `Module ${curriculumFields.length + 1}`,
      description: '',
      duration: 20,
      chapters: [
        { title: '', description: '', duration: 2 }
      ]
    });
  };

  const addChapter = (moduleIndex: number) => {
    const currentCurriculum = getValues('curriculum');
    const module = currentCurriculum[moduleIndex];
    if (module) {
      module.chapters.push({ title: '', description: '', duration: 2 });
      setValue('curriculum', currentCurriculum);
    }
  };

  const removeChapter = (moduleIndex: number, chapterIndex: number) => {
    const currentCurriculum = getValues('curriculum');
    const module = currentCurriculum[moduleIndex];
    if (module && module.chapters.length > 1) {
      module.chapters.splice(chapterIndex, 1);
      setValue('curriculum', currentCurriculum);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="Enter course name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              {...register('slug')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="course-slug"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select category</option>
              {mdCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain *
            </label>
            <select
              {...register('domain')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              {mdDomains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            {errors.domain && (
              <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <select
              {...register('industry')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select industry</option>
              {mdIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Level *
            </label>
            <select
              {...register('targetLevel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select level</option>
              {mdLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.targetLevel && (
              <p className="mt-1 text-sm text-red-600">{errors.targetLevel.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Type *
            </label>
            <select
              {...register('courseType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select course type</option>
              {mdCourseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.courseType && (
              <p className="mt-1 text-sm text-red-600">{errors.courseType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Mode *
            </label>
            <select
              {...register('deliveryMode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              {modes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            {errors.deliveryMode && (
              <p className="mt-1 text-sm text-red-600">{errors.deliveryMode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Duration (Hours) — auto-calculated from chapters
            </label>
            <input
              type="number"
              step="any"
              {...register('durationHours', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              readOnly
            />
            {errors.durationHours && (
              <p className="mt-1 text-sm text-red-600">{errors.durationHours.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="0"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Description</h3>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description *
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Detailed description of the course"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prerequisites
          </label>
          <textarea
            {...register('prerequisites')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="What students need to know before taking this course"
          />
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Learning Objectives</h3>

        <div className="space-y-3">
          {learningObjectiveFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`learningObjectives.${index}.outcome`)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Learning objective ${index + 1}`}
              />
              {learningObjectiveFields.length > 3 && (
                <button
                  type="button"
                  onClick={() => removeLearningObjective(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendLearningObjective({ outcome: '' } as any)}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Learning Objective
          </button>
        </div>

        {errors.learningObjectives && (
          <p className="text-sm text-red-600">At least 3 learning objectives are required</p>
        )}
      </div>

      {/* Curriculum */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Curriculum</h3>

        <div className="space-y-6">
          {curriculumFields.map((module, moduleIndex) => (
            <div key={module.id} className="border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Module {moduleIndex + 1}</h4>
                  {curriculumFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCurriculum(moduleIndex)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Module Title *
                    </label>
                    <input
                      {...register(`curriculum.${moduleIndex}.title`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Module title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Hours)
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register(`curriculum.${moduleIndex}.duration`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="e.g. 2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Module Description
                  </label>
                  <textarea
                    {...register(`curriculum.${moduleIndex}.description`)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Module description"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">Chapters</h5>
                    <button
                      type="button"
                      onClick={() => addChapter(moduleIndex)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Chapter
                    </button>
                  </div>

                  <div className="space-y-3">
                    {module.chapters?.map((chapter: any, chapterIndex: number) => (
                      <div key={chapterIndex} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input
                            {...register(`curriculum.${moduleIndex}.chapters.${chapterIndex}.title`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Chapter title"
                          />
                        </div>
                        <div className="w-28">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            {...register(`curriculum.${moduleIndex}.chapters.${chapterIndex}.duration`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="e.g. 1.5"
                          />
                        </div>
                        {module.chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChapter(moduleIndex, chapterIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addModule}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        {errors.curriculum && (
          <p className="text-sm text-red-600">At least 1 module is required</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || formIsSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || formIsSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Create Course' : 'Update Course'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
