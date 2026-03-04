'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Users, Video, ArrowRight } from 'lucide-react';

interface Webinar {
    id: string;
    title: string;
    slug: string;
    description: string;
    speaker: string;
    speakerImage: string | null;
    date: string;
    time: string;
    duration: number;
    timezone: string;
    imageUrl: string | null;
    status: string;
    registeredCount: number;
    maxAttendees: number | null;
    category: string | null;
    featured: boolean;
    recordingUrl: string | null;
}

export default function WebinarsPage() {
    const [filter, setFilter] = useState('upcoming');
    const [webinars, setWebinars] = useState<Webinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);

    useEffect(() => {
        fetchWebinars();
    }, [filter]);

    const fetchWebinars = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/webinars?status=${filter}`);
            const data = await response.json();
            setWebinars(data.webinars);
        } catch (error) {
            console.error('Error fetching webinars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = (webinar: Webinar) => {
        setSelectedWebinar(webinar);
        setShowRegistrationForm(true);
    };

    const submitRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedWebinar) return;

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
        };

        try {
            const response = await fetch(`/api/webinars/${selectedWebinar.id}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Successfully registered for the webinar!');
                setShowRegistrationForm(false);
                setSelectedWebinar(null);
                fetchWebinars();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to register');
            }
        } catch (error) {
            console.error('Error registering:', error);
            alert('Failed to register. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Free Webinars & Online Events</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Learn from industry experts and stay updated with the latest trends
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex gap-4 mb-12">
                            <button
                                onClick={() => setFilter('upcoming')}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Past Webinars
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                All
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-gray-600">Loading webinars...</div>
                            </div>
                        ) : webinars.length === 0 ? (
                            <div className="text-center py-12 bg-blue-50 rounded-xl p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No webinars available</h3>
                                <p className="text-gray-600">Check back soon for upcoming events!</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {webinars.map((webinar) => (
                                    <div key={webinar.id} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${webinar.status === 'UPCOMING'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {webinar.status === 'UPCOMING' ? '🔴 Live Soon' : '📹 Recording Available'}
                                                    </span>
                                                    {webinar.featured && (
                                                        <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{webinar.title}</h3>
                                                <p className="text-blue-600 font-semibold mb-3">{webinar.speaker}</p>
                                                <p className="text-gray-700 mb-4">{webinar.description}</p>

                                                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{new Date(webinar.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{webinar.time} {webinar.timezone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        <span>{webinar.registeredCount} registered{webinar.maxAttendees && ` / ${webinar.maxAttendees} max`}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            {webinar.status === 'UPCOMING' ? (
                                                <button
                                                    onClick={() => handleRegister(webinar)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                                >
                                                    Register Free
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            ) : webinar.recordingUrl ? (
                                                <a
                                                    href={webinar.recordingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Watch Recording
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Registration Modal */}
            {showRegistrationForm && selectedWebinar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-bold mb-4">Register for Webinar</h3>
                        <p className="text-gray-600 mb-6">{selectedWebinar.title}</p>

                        <form onSubmit={submitRegistration} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    Register
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRegistrationForm(false);
                                        setSelectedWebinar(null);
                                    }}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
