import { useFormContext } from 'react-hook-form';
import { CreateCourse } from '@/lib/schemas/course';

export function StepDelivery() {
    const { register, watch, setValue, formState: { errors } } = useFormContext<CreateCourse>();

    const deliveryModes = watch('deliveryMode') || [];

    const handleModeToggle = (mode: "Live Online" | "Offline" | "Hybrid") => {
        // Logic to toggle mode in array
        const current = deliveryModes;
        if (current.includes(mode as any)) { // Cast to avoid strict type check here for simplicity
            if (current.length > 1) { // Prevent unselecting the last one
                setValue('deliveryMode', current.filter((m: string) => m !== mode) as any);
            }
        } else {
            setValue('deliveryMode', [...current, mode] as any);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-navy-900 mb-4">Delivery Modes</h3>
                <p className="text-sm text-gray-500 mb-4">Select all applicable modes for this course.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["Live Online", "Offline", "Hybrid"] as const).map(mode => (
                        <div
                            key={mode}
                            onClick={() => handleModeToggle(mode)}
                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center transition-all ${deliveryModes.includes(mode)
                                    ? 'bg-navy-50 border-navy-500 text-navy-900 ring-1 ring-navy-500'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-navy-300'
                                }`}
                        >
                            <span className="font-semibold">{mode}</span>
                        </div>
                    ))}
                </div>
                {errors.deliveryMode && (
                    <p className="text-red-500 text-sm mt-2">{errors.deliveryMode.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Duration</label>
                    <div className="flex items-center gap-2">
                        <input
                            {...register('durationHours', { valueAsNumber: true })}
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                        />
                        <span className="text-gray-500">Hours</span>
                    </div>
                    {errors.durationHours && (
                        <p className="text-red-500 text-sm mt-1">{errors.durationHours.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
                    {/* This could be an enum later if needed */}
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        Detailed batch schedules can be configured in the "Batches & Schedule" step later.
                    </div>
                </div>
            </div>
        </div>
    );
}
