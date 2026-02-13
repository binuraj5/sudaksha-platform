import { useFormContext, useFieldArray } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';
import { Plus, X, Briefcase, FileText } from 'lucide-react';

export function StepDeliverables() {
    const { register, control, watch } = useFormContext<CreateCourse>();
    const courseType = watch('courseType');

    // Adaptive Labels
    const isTech = courseType === 'Technology' || courseType === 'IT';
    const isFunctional = courseType === 'Functional';

    const sectionTitle = isTech ? 'Projects & Labs' : isFunctional ? 'Case Studies & Assignments' : 'Deliverables & Artifacts';
    const itemLabel = isTech ? 'Project Title' : isFunctional ? 'Case Study Title' : 'Deliverable Title';
    const itemDesc = isTech ? 'Project Description' : 'Description';

    const { fields, append, remove } = useFieldArray({
        control,
        name: "deliverables"
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-navy-900">{sectionTitle}</h3>
                    <p className="text-sm text-gray-500">
                        {isTech ? 'Add portfolio-ready projects students will build.' : 'Add practical artifacts students will create.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => append({ title: '', description: '', type: isTech ? 'PROJECT' : 'CASE_STUDY' })}
                    className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-3 text-navy-600 font-medium">
                            {isTech ? <Briefcase className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            <span>{index + 1}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{itemLabel}</label>
                                <input
                                    {...register(`deliverables.${index}.title`)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                                    placeholder={itemLabel}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{itemDesc}</label>
                                <textarea
                                    {...register(`deliverables.${index}.description`)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                                    placeholder="Brief details..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    {...register(`deliverables.${index}.type`)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500"
                                >
                                    <option value="PROJECT">Project</option>
                                    <option value="CASE_STUDY">Case Study</option>
                                    <option value="ASSESSMENT">Assessment</option>
                                    <option value="TOOLKIT">Toolkit</option>
                                    <option value="FRAMEWORK">Process Framework</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <p className="text-gray-500">No deliverables added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
