'use client';

import '@/styles/globals.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const aiSchema = z.object({
  context: z.string().min(50, 'Context must be at least 50 characters'),
  industry: z.string().min(2, 'Industry is required'),
  targetAudience: z.string().min(10, 'Target audience description is required'),
  duration: z.number().min(10, 'Duration must be at least 10 hours').max(200, 'Duration cannot exceed 200 hours'),
  price: z.number().min(5000, 'Price must be at least ₹5000'),
});

type AIFormData = z.infer<typeof aiSchema>;

interface AICourseBuilderProps {
  onComplete: (data: any) => void;
}

const AICourseBuilder = ({ onComplete }: AICourseBuilderProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AIFormData>({
    resolver: zodResolver(aiSchema),
    defaultValues: {
      duration: 40,
      price: 25000,
    }
  });

  const onSubmit = async (data: AIFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: data.context,
          industry: data.industry,
          target_audience: data.targetAudience,
          duration_hours: data.duration,
          price: data.price,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const result = await response.json();

      // Transform AI response to match our expected format
      const courseData = {
        course: {
          ...result.course,
          // Ensure proper typing
          category: result.course.category,
          courseType: result.course.courseType,
          targetLevel: result.course.level,
          categoryType: result.course.isIT ? 'IT' : 'NON_IT',
          isIT: result.course.isIT,
          skillTags: result.course.skillTags,
          learningObjectives: result.course.learningObjectives,
        },
        modules: result.modules.map((module: any, index: number) => ({
          ...module,
          order: index + 1,
        })),
        lessons: result.lessons.map((lesson: any, index: number) => ({
          ...lesson,
          order: index + 1,
        })),
      };

      onComplete(courseData);
    } catch (err) {
      console.error('AI course generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate course');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Course Builder</h2>
          <p className="text-slate-600">
            Describe your training program and let AI create a comprehensive course structure
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Training Context */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Training Context *
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Describe what the training program covers, its objectives, and key topics
            </p>
            <textarea
              {...register('context')}
              rows={6}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="e.g., This comprehensive training program covers modern web development technologies including React, Node.js, and cloud deployment. Students will learn to build full-stack applications from scratch, implement responsive designs, and deploy applications to production environments. The program includes hands-on projects and focuses on industry best practices."
            />
            {errors.context && (
              <p className="mt-1 text-sm text-red-600">{errors.context.message}</p>
            )}
          </div>

          {/* Industry & Target Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Industry *
              </label>
              <input
                {...register('industry')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Technology, Healthcare, Finance"
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Audience *
              </label>
              <input
                {...register('targetAudience')}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Junior developers, IT professionals"
              />
              {errors.targetAudience && (
                <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
              )}
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (hours) *
              </label>
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="40"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="25000"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* AI Capabilities Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-900 mb-2">What AI will generate:</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Complete course structure with modules and lessons</li>
              <li>• Industry-appropriate skill tags and learning objectives</li>
              <li>• Realistic course categorization and target levels</li>
              <li>• Balanced module durations and content breakdown</li>
              <li>• Professional course descriptions and titles</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Course Structure...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Course with AI</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sample Prompts */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="font-medium text-slate-900 mb-4">Sample Training Contexts:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                "Advanced cloud computing training covering AWS, Azure, and GCP. Focus on infrastructure as code, serverless architecture, and DevOps practices for enterprise applications."
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                "Leadership development program for mid-level managers. Includes strategic thinking, team management, communication skills, and change management methodologies."
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                "Cybersecurity fundamentals for IT professionals. Covers threat analysis, network security, ethical hacking, and compliance frameworks like ISO 27001."
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">
                "Data science and analytics training using Python, R, and machine learning. Includes statistical analysis, data visualization, and predictive modeling."
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AICourseBuilder;
