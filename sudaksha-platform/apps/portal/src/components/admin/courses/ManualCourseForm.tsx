'use client';

import '@/styles/globals.css';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import { CourseCategory, CourseType, TargetLevel, CategoryType } from '@/types/course';

const courseSchema = z.object({
  name: z.string().min(3, 'Course name must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters'),
  category: z.nativeEnum(CourseCategory),
  courseType: z.nativeEnum(CourseType),
  categoryType: z.nativeEnum(CategoryType),
  industry: z.string().min(1, 'Industry is required'),
  targetLevel: z.nativeEnum(TargetLevel),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  price: z.number().min(1000, 'Price must be at least ₹1000'),
  skillTags: z.array(z.string()).min(1, 'At least one skill tag is required'),
  learningObjectives: z.array(z.string()).min(1, 'At least one learning objective is required'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface ManualCourseFormProps {
  onComplete: (data: any) => void;
}

const ManualCourseForm = ({ onComplete }: ManualCourseFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [modules, setModules] = useState<any[]>([]);
  const [currentModule, setCurrentModule] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      skillTags: [],
      learningObjectives: [],
    }
  });

  const watchedSkillTags = watch('skillTags') || [];
  const watchedObjectives = watch('learningObjectives') || [];

  const addSkillTag = () => {
    const currentTags = watchedSkillTags;
    setValue('skillTags', [...currentTags, '']);
  };

  const updateSkillTag = (index: number, value: string) => {
    const currentTags = [...watchedSkillTags];
    currentTags[index] = value;
    setValue('skillTags', currentTags);
  };

  const removeSkillTag = (index: number) => {
    const currentTags = watchedSkillTags.filter((_, i) => i !== index);
    setValue('skillTags', currentTags);
  };

  const addObjective = () => {
    const currentObjectives = watchedObjectives;
    setValue('learningObjectives', [...currentObjectives, '']);
  };

  const updateObjective = (index: number, value: string) => {
    const currentObjectives = [...watchedObjectives];
    currentObjectives[index] = value;
    setValue('learningObjectives', currentObjectives);
  };

  const removeObjective = (index: number) => {
    const currentObjectives = watchedObjectives.filter((_, i) => i !== index);
    setValue('learningObjectives', currentObjectives);
  };

  const onSubmitCourse = (data: CourseFormData) => {
    setCurrentStep(2);
  };

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      order: modules.length + 1,
      duration: 0,
      lessons: []
    };
    setModules([...modules, newModule]);
    setCurrentModule(newModule);
  };

  const updateModule = (moduleId: string, updates: any) => {
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, ...updates } : m
    ));
  };

  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      const newLesson = {
        id: `lesson-${Date.now()}`,
        title: '',
        description: '',
        content: '',
        duration: 60,
        order: module.lessons.length + 1,
        isFree: false
      };
      const updatedLessons = [...module.lessons, newLesson];
      updateModule(moduleId, { lessons: updatedLessons });
    }
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: any) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map((l: any) =>
            l.id === lessonId ? { ...l, ...updates } : l
          )
        };
      }
      return m;
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter((l: any) => l.id !== lessonId)
        };
      }
      return m;
    }));
  };

  const handleComplete = () => {
    // Combine course data with modules and lessons
    const courseData = watch();
    onComplete({
      course: courseData,
      modules: modules,
      lessons: modules.flatMap(m => m.lessons.map((l: any) => ({ ...l, moduleId: m.id })))
    });
  };

  const steps = [
    { id: 1, title: 'Course Details', description: 'Basic information and settings' },
    { id: 2, title: 'Modules & Lessons', description: 'Create course structure' },
    { id: 3, title: 'Review & Publish', description: 'Final review before publishing' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
                }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <div className={`font-medium ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-600'
                  }`}>
                  {step.title}
                </div>
                <div className="text-sm text-slate-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-slate-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Course Details */}
      {currentStep === 1 && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmitCourse)}
          className="bg-white rounded-lg shadow-sm p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-slate-900">Course Information</h2>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Name *
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Full Stack Web Development"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {Object.values(CourseCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Short Description *
              </label>
              <input
                {...register('shortDescription')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description for course cards"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed course description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Course Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Course Type *
              </label>
              <select
                {...register('courseType')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                {Object.values(CourseType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Domain *
              </label>
              <select
                {...register('categoryType')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select domain</option>
                <option value="IT">IT</option>
                <option value="NON_IT">Non-IT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Level *
              </label>
              <select
                {...register('targetLevel')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select level</option>
                {Object.values(TargetLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Industry *
            </label>
            <input
              {...register('industry')}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Technology, Healthcare, Finance"
            />
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (hours) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="40"
                />
              </div>
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price (₹) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25000"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Skill Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Skill Tags *
              </label>
              <button
                type="button"
                onClick={addSkillTag}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tag</span>
              </button>
            </div>
            <div className="space-y-2">
              {watchedSkillTags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    value={tag}
                    onChange={(e) => updateSkillTag(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., React, Node.js"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkillTag(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.skillTags && (
              <p className="mt-1 text-sm text-red-600">{errors.skillTags.message}</p>
            )}
          </div>

          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Learning Objectives *
              </label>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Objective</span>
              </button>
            </div>
            <div className="space-y-2">
              {watchedObjectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Master modern JavaScript frameworks"
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.learningObjectives && (
              <p className="mt-1 text-sm text-red-600">{errors.learningObjectives.message}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Next: Create Modules
            </button>
          </div>
        </motion.form>
      )}

      {/* Step 2: Modules & Lessons */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Course Structure</h2>
              <button
                onClick={addModule}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Module</span>
              </button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No modules added yet. Click "Add Module" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div key={module.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-slate-900">Module {index + 1}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => addLesson(module.id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Lesson
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, { title: e.target.value })}
                        className="px-3 py-2 border border-slate-200 rounded-md"
                        placeholder="Module title"
                      />
                      <input
                        type="number"
                        value={module.duration}
                        onChange={(e) => updateModule(module.id, { duration: parseInt(e.target.value) })}
                        className="px-3 py-2 border border-slate-200 rounded-md"
                        placeholder="Duration (hours)"
                      />
                    </div>

                    <textarea
                      value={module.description}
                      onChange={(e) => updateModule(module.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md mb-4"
                      placeholder="Module description"
                      rows={2}
                    />

                    {/* Lessons */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-700">Lessons</h4>
                      {module.lessons.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                          <input
                            value={lesson.title}
                            onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                            className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm"
                            placeholder="Lesson title"
                          />
                          <input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(module.id, lesson.id, { duration: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                            placeholder="60"
                          />
                          <button
                            onClick={() => removeLesson(module.id, lesson.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={modules.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Review Course
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Review Course</h2>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="font-medium text-slate-900 mb-2">Course Summary</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium">{watch('name')}</h4>
                <p className="text-sm text-slate-600 mt-1">{watch('shortDescription')}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                  <span>{watch('duration')} hours</span>
                  <span>₹{watch('price')}</span>
                  <span>{watch('targetLevel')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-slate-900 mb-2">Modules ({modules.length})</h3>
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <div key={module.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{module.title}</span>
                      <span className="text-sm text-slate-600">{module.lessons.length} lessons</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Back to Edit
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Publish Course
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ManualCourseForm;
