import { useFormContext } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function StepSchedule() {
    const { } = useFormContext<CreateCourse>();

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-blue-900 mb-2">Batch Scheduling</h3>
                        <p className="text-blue-700 text-sm mb-4">
                            Specific batch schedules (Dates, Times, Venue) are best managed <strong>after</strong> the course structure is created.
                        </p>
                        <p className="text-blue-700 text-sm">
                            However, you can set defaults here:
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Class Timings</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500 text-sm">Managed per batch</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Venue (if Offline)</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500 text-sm">Managed per batch</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-navy-900 mb-4">Course Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (INR)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            {...useFormContext().register('price', { valueAsNumber: true })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500"
                            placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave 0 for free courses.</p>
                    </div>
                </div>
            </div>

            <div className="text-center py-6 text-gray-500 text-sm">
                You will be redirected to the Batch Manager after saving this course.
            </div>
        </div>
    );
}
