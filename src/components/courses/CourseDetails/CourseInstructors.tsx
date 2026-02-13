import { Users, Linkedin } from 'lucide-react';
import Image from 'next/image';
import { CourseInstructor } from '../../../types/course';

interface CourseInstructorsProps {
    instructors: CourseInstructor[];
}

export function CourseInstructors({ instructors }: CourseInstructorsProps) {
    if (!instructors || instructors.length === 0) return null;

    return (
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Meet Your Instructors
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {instructors.map((instructor, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors bg-gray-50/50">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-sm mx-auto sm:mx-0">
                                {instructor.photoUrl ? (
                                    <img
                                        src={instructor.photoUrl}
                                        alt={instructor.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl">
                                        {instructor.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{instructor.name}</h3>
                            <p className="text-blue-600 font-medium text-sm mb-3">{instructor.title || 'Instructor'}</p>

                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                                {instructor.yearsExperience && instructor.yearsExperience > 0 && (
                                    <span className="text-xs px-2 py-1 bg-white rounded-full border border-gray-200 text-gray-600">
                                        {instructor.yearsExperience}+ Years Exp.
                                    </span>
                                )}
                            </div>

                            {instructor.bio && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                    {instructor.bio}
                                </p>
                            )}

                            {instructor.linkedinUrl && (
                                <a
                                    href={instructor.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                                >
                                    <Linkedin className="w-4 h-4 mr-1.5" />
                                    View Profile
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
