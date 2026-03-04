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

const domains = ['IT', 'Non-IT', 'All'];
const industries = [
  'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
  'Education', 'Consulting', 'Pharmaceutical', 'Telecommunications',
  'Automotive', 'Aviation', 'Defense'
];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const types = ['Technology', 'IT', 'Functional', 'Process', 'Behavioral', 'Personal'];
const modes = ['Live Online', 'Offline', 'Hybrid'];
const statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

interface AdminCourseFormProps {
  course?: any;
  onSave: (courseData: Partial<any>) => Promise<void>;
  mode: 'create' | 'edit';
}

export default function AdminCourseForm({ course, onSave, mode }: AdminCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      learningObjectives: course?.learningObjectives || ['', '', ''],
      specialFeatures: course?.specialFeatures || [],
      curriculum: course?.modules || [
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
        learningObjectives: course.learningObjectives,
        specialFeatures: course.specialFeatures,
        curriculum: course.modules || []
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
              <option value="IT Courses">IT Courses</option>
              <option value="Data Science">Data Science</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="AI & ML">AI & ML</option>
              <option value="Business Analysis">Business Analysis</option>
              <option value="Project Management">Project Management</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Communication">Communication</option>
              <option value="Leadership">Leadership</option>
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
              {domains.map(domain => (
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
              {industries.map(industry => (
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
              {levels.map(level => (
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
              {types.map(type => (
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
              Duration (Hours) *
            </label>
            <input
              type="number"
              {...register('durationHours', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="120"
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
                {...register(`learningObjectives.${index}`)}
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
            onClick={() => appendLearningObjective('' as any)}
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
                      {...register(`curriculum.${moduleIndex}.duration`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="20"
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
                        <div className="w-24">
                          <input
                            type="number"
                            {...register(`curriculum.${moduleIndex}.chapters.${chapterIndex}.duration`, { valueAsNumber: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="2h"
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
