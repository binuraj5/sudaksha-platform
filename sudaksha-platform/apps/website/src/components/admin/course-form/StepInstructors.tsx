import { useFormContext, useFieldArray } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';
import { UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTrainers } from '@/lib/actions/trainers';

export function StepInstructors() {
    const { register, control, setValue, formState: { errors } } = useFormContext<CreateCourse>();
    const [availableTrainers, setAvailableTrainers] = useState<any[]>([]);

    // Fetch trainers on mount
    useEffect(() => {
        getTrainers().then(setAvailableTrainers).catch(console.error);
    }, []);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "instructors"
    });

    const handleTrainerSelect = (index: number, trainerId: string) => {
        const selected = availableTrainers.find(t => t.id === trainerId);
        if (selected) {
            setValue(`instructors.${index}.name`, selected.name);
            setValue(`instructors.${index}.title`, 'Professional Trainer'); // Default
            setValue(`instructors.${index}.bio`, selected.bio || 'Experienced certified trainer.');
            setValue(`instructors.${index}.linkedinUrl`, selected.linkedinUrl || '');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-navy-900">Instructors</h3>
                    <p className="text-sm text-gray-500">Assign trainers to this course from the database.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ name: '', isPrimary: fields.length === 0 })}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" /> Add Instructor
                </button>
            </div>

            {fields.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <UserPlus className="w-6 h-6 text-navy-600" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">No Instructors Assigned</h4>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm">
                        Add at least one instructor to this course. You can select existing trainers from the database.
                    </p>
                    <button
                        type="button"
                        onClick={() => append({ name: '', isPrimary: true })}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Add Instructor Slot
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2">
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove Instructor"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-full md:w-1/3 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Trainer from Database</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 bg-white"
                                    onChange={(e) => handleTrainerSelect(index, e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled>-- Select a Trainer --</option>
                                    <option value="none" className="text-gray-500 font-medium">✨ Keep Empty (Manual Entry)</option>
                                    <optgroup label="Available Trainers">
                                        {availableTrainers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} {t.expertise && Array.isArray(t.expertise) ? `(${t.expertise[0]})` : ''}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-xs text-blue-800 flex flex-col gap-1">
                                    <span className="font-semibold">Need a new trainer?</span>
                                    <span>
                                        Go to <a href="/admin/trainers" target="_blank" className="underline hover:text-blue-900">Trainer Management</a> to add one, then refresh this page.
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="w-full md:w-2/3 space-y-4 md:border-l md:pl-6 border-gray-100">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                                <span className="text-sm font-semibold text-gray-900">Instructor Details</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {index === 0 ? 'Primary Instructor' : 'Co-Instructor'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Display Name *</label>
                                    <input
                                        {...register(`instructors.${index}.name`)}
                                        placeholder="e.g. Dr. John Doe"
                                        className={`w-full px-3 py-2 border rounded-lg ${errors.instructors?.[index]?.name ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.instructors?.[index]?.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.instructors[index]?.name?.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        {...register(`instructors.${index}.title`)}
                                        placeholder="e.g. Senior Solution Architect"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Short Bio</label>
                                <textarea
                                    {...register(`instructors.${index}.bio`)}
                                    rows={3}
                                    placeholder="Brief professional summary..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                                <input
                                    {...register(`instructors.${index}.linkedinUrl`)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
