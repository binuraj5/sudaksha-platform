import { createTrainer } from '@/lib/actions/trainers';

export default function AddTrainerPage() {
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy-900">Add New Trainer</h1>
                <p className="text-gray-500">Enter trainer details. Validation is minimal for internal use.</p>
            </div>

            <form action={async (formData) => {
                'use server';
                await createTrainer(formData);
            }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="e.g. Dr. Sarah Smith"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="sarah@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expertise / Skills *</label>
                    <p className="text-xs text-gray-500 mb-2">Primary skills (comma separated), e.g. "Project Management, Agile, Leadership"</p>
                    <input
                        name="expertise"
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="e.g. Java, Cloud Computing, Leadership"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                            name="experience"
                            type="number"
                            min="0"
                            defaultValue="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Link (LinkedIn)</label>
                        <input
                            name="linkedinUrl"
                            type="url"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                    <textarea
                        name="bio"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        placeholder="Brief professional biography (2-3 sentences)..."
                    ></textarea>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 font-medium"
                    >
                        Create Trainer
                    </button>
                </div>
            </form>
        </div>
    );
}
