import { useFormContext, useFieldArray } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';
import { Plus, X, ListChecks } from 'lucide-react';

export function StepOutcomes() {
    const { register, control, formState: { errors } } = useFormContext<CreateCourse>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "learningObjectives" as any // Casting because original schema had string array, but we updated schema to object array
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-navy-900">Learning Outcomes</h3>
                    <p className="text-sm text-gray-500">What will students be able to do after this course? (Min 3 required)</p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ outcome: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Outcome
                </button>
            </div>

            {errors.learningObjectives && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                    {/* @ts-ignore */}
                    {errors.learningObjectives.message || "Please add at least 3 outcomes."}
                </div>
            )}

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3">
                        <div className="pt-3 text-navy-300">
                            <ListChecks className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <input
                                {...register(`learningObjectives.${index}.outcome` as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                                placeholder={`Outcome #${index + 1}`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No outcomes added.
                    </div>
                )}
            </div>
        </div>
    );
}
