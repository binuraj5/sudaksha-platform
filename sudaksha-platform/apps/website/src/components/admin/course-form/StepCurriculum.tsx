import { useFormContext, useFieldArray } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';
import { Plus, X, Trash2, GripVertical, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StepCurriculum() {
    const { register, control, formState: { errors } } = useFormContext<CreateCourse>();

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "curriculum"
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-navy-900">Curriculum Modules</h3>
                    <p className="text-sm text-gray-500">Structure your course content. Add at least one module.</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ title: '', description: '', chapters: [] })}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Module
                </button>
            </div>

            {errors.curriculum && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {errors.curriculum.message}
                </div>
            )}

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <ModuleCard key={field.id} index={index} onRemove={() => remove(index)} register={register} control={control} />
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <p className="text-gray-500">No modules added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ModuleCard({ index, onRemove, register, control }: { index: number, onRemove: () => void, register: any, control: any }) {
    // Nested Field Array for Chapters can be added here if needed, but keeping it simple for now or strictly following schema
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative group">
            <div className="flex items-start gap-4">
                <div className="pt-3 text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-4">
                    {/* Module Header Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            {...register(`curriculum.${index}.title`)}
                            placeholder="Module Title (e.g. Introduction to React)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                        />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <input
                                {...register(`curriculum.${index}.duration`, { valueAsNumber: true })}
                                type="number"
                                placeholder="Duration (hrs)"
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                            />
                        </div>
                    </div>
                    <textarea
                        {...register(`curriculum.${index}.description`)}
                        placeholder="What will students learn in this module?"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
