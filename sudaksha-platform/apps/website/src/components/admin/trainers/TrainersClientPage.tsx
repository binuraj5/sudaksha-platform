'use client';

import { useState, useEffect } from 'react';
import { Trainer } from '@prisma/client';
import { createTrainer, updateTrainer, deleteTrainer, toggleTrainerStatus } from '@/lib/actions/trainers';
import { Plus, Edit, Trash2, Eye, X, Linkedin, Check, Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrainersClientPageProps {
    initialTrainers: Trainer[];
}

export default function TrainersClientPage({ initialTrainers }: TrainersClientPageProps) {
    const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentTrainer, setCurrentTrainer] = useState<Trainer | null>(null);
    const [mode, setMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Refresh local data from server
    useEffect(() => {
        setTrainers(initialTrainers);
        // If we were editing/adding and the modal is closed, reset loading
        if (!isModalOpen) {
            setIsLoading(false);
        }
    }, [initialTrainers, isModalOpen]);

    const refreshData = () => {
        router.refresh();
    };

    const handleAddClick = () => {
        setMode('ADD');
        setCurrentTrainer(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (trainer: Trainer) => {
        setMode('EDIT');
        setCurrentTrainer(trainer);
        setIsModalOpen(true);
    };

    const handleViewClick = (trainer: Trainer) => {
        setCurrentTrainer(trainer);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (confirm('Are you sure you want to delete this trainer?')) {
            await deleteTrainer(id);
            refreshData();
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setTrainers(prev => prev.map(t => t.id === id ? { ...t, isPublished: !currentStatus } : t));
        await toggleTrainerStatus(id, currentStatus);
        refreshData();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        let result;

        try {
            if (mode === 'ADD') {
                result = await createTrainer(formData);
            } else if (currentTrainer) {
                result = await updateTrainer(currentTrainer.id, formData);
            }

            if (result && !result.success) {
                alert(`Error: ${result.error || 'Unknown error occurred'}`);
                setIsLoading(false);
                return;
            }

            setIsModalOpen(false);
            refreshData();
        } catch (error) {
            console.error("Failed to save trainer:", error);
            alert("Failed to save trainer. Please check the console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-navy-900">Trainers</h1>
                    <p className="text-gray-500">Manage your training faculty</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 font-medium flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add New Trainer
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4 font-semibold text-gray-700 uppercase text-xs tracking-wider">Name / Email</th>
                            <th className="text-left p-4 font-semibold text-gray-700 uppercase text-xs tracking-wider">Expertise</th>
                            <th className="text-left p-4 font-semibold text-gray-700 uppercase text-xs tracking-wider">Status</th>
                            <th className="text-left p-4 font-semibold text-gray-700 uppercase text-xs tracking-wider">Published</th>
                            <th className="text-right p-4 font-semibold text-gray-700 uppercase text-xs tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {trainers.map((trainer) => (
                            <tr key={trainer.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-medium text-navy-900">{trainer.name}</div>
                                    <div className="text-sm text-gray-500">{trainer.email}</div>
                                    {trainer.linkedinUrl && (
                                        <a href={trainer.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-navy-600 hover:text-navy-800 text-xs flex items-center gap-1 mt-1">
                                            <Linkedin className="w-3 h-3" /> Profile
                                        </a>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-600 max-w-xs">
                                    {Array.isArray(trainer.expertise) && (trainer.expertise as string[]).length > 0
                                        ? (
                                            <div className="flex flex-wrap gap-1">
                                                {(trainer.expertise as string[]).slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{skill}</span>
                                                ))}
                                                {(trainer.expertise as string[]).length > 3 && <span className="text-xs text-gray-400">+{((trainer.expertise as string[]).length - 3)} more</span>}
                                            </div>
                                        )
                                        : <span className="text-gray-400 italic">No expertise listed</span>}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trainer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {trainer.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggleStatus(trainer.id, trainer.isPublished)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${trainer.isPublished ? 'bg-navy-600' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${trainer.isPublished ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                    <span className="text-xs text-gray-500 ml-2">{trainer.isPublished ? 'Live' : 'Hidden'}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleViewClick(trainer)}
                                            className="p-1.5 text-gray-500 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors" title="View Details">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(trainer)}
                                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(trainer.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {trainers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="w-8 h-8 text-gray-300" />
                                        <p>No trainers found. Add your first trainer to get started.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-navy-900">{mode === 'ADD' ? 'Add New Trainer' : 'Edit Trainer'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input name="name" type="text" required defaultValue={currentTrainer?.name}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" placeholder="e.g. Dr. Sarah Smith" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                    <input name="email" type="email" required defaultValue={currentTrainer?.email}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" placeholder="sarah@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-gray-400 text-xs">(Optional)</span></label>
                                    <input name="phone" type="tel"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" placeholder="+1 234 567 890" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                    <input name="experience" type="number" min="0" defaultValue={currentTrainer?.experience || 1}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expertise / Skills *</label>
                                <p className="text-xs text-gray-500 mb-2">Comma separated (e.g. Java, Python, Leadership)</p>
                                <input name="expertise" type="text" required defaultValue={Array.isArray(currentTrainer?.expertise) ? (currentTrainer?.expertise as string[]).join(', ') : ''}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" placeholder="e.g. Project Management, Agile" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                <input name="linkedinUrl" type="url" defaultValue={currentTrainer?.linkedinUrl || ''}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" placeholder="https://linkedin.com/in/..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea name="bio" rows={4} defaultValue={currentTrainer?.bio}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500" placeholder="Professional biography..." />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-6 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 flex items-center gap-2">
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {mode === 'ADD' ? 'Add Trainer' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && currentTrainer && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-navy-900">Trainer Profile</h2>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 text-2xl font-bold">
                                    {currentTrainer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{currentTrainer.name}</h3>
                                    <p className="text-gray-500">{currentTrainer.email}</p>
                                    <div className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${currentTrainer.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {currentTrainer.isPublished ? 'Profile Published' : 'Profile Hidden'}
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Expertise</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(currentTrainer.expertise) ? (currentTrainer.expertise as string[]).map((s, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                                    )) : <span className="text-gray-500">None</span>}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{currentTrainer.bio || "No bio available."}</p>
                            </div>

                            {currentTrainer.linkedinUrl && (
                                <div className="border-t pt-4">
                                    <a href={currentTrainer.linkedinUrl} target="_blank" className="flex items-center gap-2 text-navy-600 hover:underline">
                                        <Linkedin className="w-4 h-4" /> View LinkedIn Profile
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
