'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Filter } from 'lucide-react';

export default function CalendarPage() {
    const [filter, setFilter] = useState('all');

    const upcomingEvents = [
        {
            id: 1,
            title: 'AWS Cloud Practitioner Bootcamp',
            type: 'course',
            date: '2026-04-05',
            time: '10:00 AM - 5:00 PM',
            mode: 'Online',
            seats: '15 seats remaining',
        },
        {
            id: 2,
            title: 'PMP Certification Prep Course',
            type: 'course',
            date: '2026-04-12',
            time: '9:00 AM - 4:00 PM',
            mode: 'Hybrid',
            seats: '8 seats remaining',
        },
        {
            id: 3,
            title: 'Data Analytics Career Webinar',
            type: 'webinar',
            date: '2026-04-10',
            time: '6:00 PM - 7:30 PM',
            mode: 'Online',
            seats: 'Open to all',
        },
        {
            id: 4,
            title: 'Full Stack Development Program',
            type: 'course',
            date: '2026-05-03',
            time: '10:00 AM - 6:00 PM',
            mode: 'In-Person',
            seats: '20 seats remaining',
        },
    ];

    const filtered = filter === 'all' ? upcomingEvents : upcomingEvents.filter(e => e.type === filter);

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">Course Calendar & Events</h1>
                        <p className="text-xl text-blue-100">
                            View upcoming batches, webinars, and events
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Filters */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                All Events
                            </button>
                            <button
                                onClick={() => setFilter('course')}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === 'course' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Courses
                            </button>
                            <button
                                onClick={() => setFilter('webinar')}
                                className={`px-6 py-2 rounded-full font-semibold transition-colors ${filter === 'webinar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Webinars
                            </button>
                        </div>

                        {/* Events List */}
                        <div className="space-y-6">
                            {filtered.map((event) => (
                                <div key={event.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-3">
                                                {event.type === 'course' ? '📚 Course' : '🎯 Webinar'}
                                            </span>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>
                                            <div className="flex flex-wrap gap-4 text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{event.mode}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.seats}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0 md:ml-6">
                                            <Link
                                                href="/contact"
                                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                            >
                                                {event.type === 'course' ? 'Enroll Now' : 'Register Free'}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
