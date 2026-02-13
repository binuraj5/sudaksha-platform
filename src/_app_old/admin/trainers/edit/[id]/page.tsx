import { getTrainerById, updateTrainer } from '@/lib/actions/trainers';
import { notFound } from 'next/navigation';

export default async function EditTrainerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const trainer = await getTrainerById(id);

    if (!trainer) {
        notFound();
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-navy-900">Edit Trainer</h1>
                <p className="text-gray-500">Update trainer profile details.</p>
            </div>

            <form action={async (formData) => {
                'use server';
                await updateTrainer(id, formData);
            }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                        name="name"
                        type="text"
                        required
                        defaultValue={trainer.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                        name="email"
                        type="email"
                        required
                        defaultValue={trainer.email}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expertise / Skills *</label>
                    <p className="text-xs text-gray-500 mb-2">Primary skills (comma separated)</p>
                    <input
                        name="expertise"
                        type="text"
                        defaultValue={Array.isArray(trainer.expertise) ? (trainer.expertise as string[]).join(', ') : ''}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <input
                            name="experience"
                            type="number"
                            min="0"
                            defaultValue={trainer.experience}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Link (LinkedIn)</label>
                        <input
                            name="linkedinUrl"
                            type="url"
                            defaultValue={trainer.linkedinUrl || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                    <textarea
                        name="bio"
                        rows={4}
                        defaultValue={trainer.bio}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
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
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
