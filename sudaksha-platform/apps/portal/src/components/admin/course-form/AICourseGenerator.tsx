'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AIGenerateCourseSchema, AIGenerateCourse, CreateCourse } from '@/lib/schemas/course';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { CourseCategory, CourseType, CategoryType, TargetLevel, BatchMode } from '@/types/course';

interface AICourseGeneratorProps {
    onSuccess: (data: CreateCourse) => void;
}

export function AICourseGenerator({ onSuccess }: AICourseGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [masterData, setMasterData] = useState({
        categories: [],
        domains: [],
        courseTypes: [],
        levels: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, domRes, typeRes, lvlRes] = await Promise.all([
                    fetch('/api/admin/master-data?type=category'),
                    fetch('/api/admin/master-data?type=domain'),
                    fetch('/api/admin/master-data?type=courseType'),
                    fetch('/api/admin/master-data?type=level')
                ]);

                const [categories, domains, courseTypes, levels] = await Promise.all([
                    catRes.json(), domRes.json(), typeRes.json(), lvlRes.json()
                ]);

                setMasterData({
                    categories: categories.success ? categories.data : [],
                    domains: domains.success ? domains.data : [],
                    courseTypes: courseTypes.success ? courseTypes.data : [],
                    levels: levels.success ? levels.data : []
                });
            } catch (error) {
                console.error("Failed to fetch master data", error);
            }
        };
        fetchData();
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm<AIGenerateCourse>({
        resolver: zodResolver(AIGenerateCourseSchema),
        defaultValues: {
            domain: 'IT',
            category: 'Software Development',
            targetLevel: 'Beginner',
            courseType: 'Technology',
            deliveryMode: 'Live Online',
            durationHours: 40
        }
    });

    const onSubmit = async (data: AIGenerateCourse) => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to generate course');
            }

            if (result.course) {
                onSuccess(result.course);
            }
        } catch (err) {
            console.error('AI Generation Error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Course Generator</h2>
                    <p className="text-gray-500 mt-2">Describe your course and let AI build the curriculum, modules, and content structure for you.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Concept / Topic *
                        </label>
                        <textarea
                            {...register('prompt')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32 resize-none text-gray-900 bg-white"
                            placeholder="e.g. A comprehensive specialized course on React Native for mobile app development with a focus on real-world performance optimization..."
                        />
                        {errors.prompt && (
                            <p className="text-red-500 text-sm mt-1">{errors.prompt.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Please provide at least 10 characters describing the course.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                            <select {...register('domain')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white">
                                {masterData.domains.length > 0 ? (
                                    masterData.domains.map((item: any) => (
                                        <option key={item.id} value={item.name}>{item.name}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="IT">IT</option>
                                        <option value="Non-IT">Non-IT</option>
                                        <option value="All">All</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                {...register('category')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                            >
                                {masterData.categories.length > 0 ? (
                                    masterData.categories.map((item: any) => (
                                        <option key={item.id} value={item.name}>{item.name}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Software Development">Software Development</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Business">Business</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Industry Focus *</label>
                            <input
                                {...register('industry')}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                                placeholder="e.g. Healthcare, Finance, Tech"
                            />
                            {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Target Level</label>
                            <select {...register('targetLevel')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white">
                                {masterData.levels.length > 0 ? (
                                    masterData.levels.map((item: any) => (
                                        <option key={item.id} value={item.name}>{item.name}</option>
                                    ))
                                ) : (
                                    <option value="Beginner">Beginner</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
                            <select {...register('courseType')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white">
                                {masterData.courseTypes.length > 0 ? (
                                    masterData.courseTypes.map((item: any) => (
                                        <option key={item.id} value={item.name}>{item.name}</option>
                                    ))
                                ) : (
                                    <option value="Technology">Technology</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Mode</label>
                            <select {...register('deliveryMode')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white">
                                <option value="Live Online">Live Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Est. Duration (Hours)</label>
                            <input
                                {...register('durationHours', { valueAsNumber: true })}
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                                placeholder="40"
                            />
                            {errors.durationHours && <p className="text-red-500 text-sm mt-1">{errors.durationHours.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Course Structure...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Course with AI
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        This process usually takes 20-30 seconds. The AI will generate a complete curriculum, learning objectives, and initial content.
                    </p>
                </form>
            </div>
        </div>
    );
}
