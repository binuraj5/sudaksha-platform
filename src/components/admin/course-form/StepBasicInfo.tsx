import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';
import { CourseCategory } from '@/types/course';

// Helper to format enum values to readable labels
const formatCategoryLabel = (category: string) => {
    return category
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
};

export function StepBasicInfo() {
    const { register, formState: { errors } } = useFormContext<CreateCourse>();
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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name *
                    </label>
                    <input
                        {...register('name')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900 bg-white"
                        placeholder="e.g. Master Full Stack Development"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        {...register('category')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900 bg-white"
                    >
                        <option value="">Select Category</option>
                        {masterData.categories.map((item: any) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domain
                    </label>
                    <select
                        {...register('domain')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900 bg-white"
                    >
                        <option value="">Select Domain</option>
                        {masterData.domains.map((item: any) => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                        {/* Fallback if empty */}
                        {masterData.domains.length === 0 && (
                            <>
                                <option value="IT">IT</option>
                                <option value="Non-IT">Non-IT</option>
                            </>
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Type (Adaptive)
                    </label>
                    <select
                        {...register('courseType')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900 bg-white"
                    >
                        <option value="">Select Type</option>
                        {masterData.courseTypes.map((item: any) => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                        {/* Fallback */}
                        {masterData.courseTypes.length === 0 && (
                            <option value="Technology">Technology</option>
                        )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Changing this will adapt future form steps.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                    </label>
                    <input
                        {...register('industry')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900 bg-white"
                        placeholder="e.g. Banking, Telecom, Retail"
                    />
                    {errors.industry && (
                        <p className="text-red-500 text-sm mt-1">{errors.industry.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Level *
                    </label>
                    <select
                        {...register('targetLevel')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 text-gray-900 bg-white"
                    >
                        <option value="">Select Level</option>
                        {masterData.levels.map((item: any) => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                        {masterData.levels.length === 0 && (
                            <option value="Beginner">Beginner</option>
                        )}
                    </select>
                    {errors.targetLevel && (
                        <p className="text-red-500 text-sm mt-1">{errors.targetLevel.message}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                </label>
                <textarea
                    {...register('description')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 h-32 text-gray-900 bg-white"
                    placeholder="Detailed course description..."
                />
                {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
            </div>
        </div>
    );
}
