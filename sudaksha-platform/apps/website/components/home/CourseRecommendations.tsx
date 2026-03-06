'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, Award, BookOpen, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TRACKS = [
  { key: 'Technology', label: 'Technology', description: 'Software, Cloud, AI/ML, DevOps' },
  { key: 'Domain', label: 'Domain Specific', description: 'Industry & functional expertise' },
  { key: 'Behavioural', label: 'Behavioural', description: 'Leadership & communication' },
  { key: 'Cognitive', label: 'Cognitive', description: 'Analytical & problem-solving' },
];

interface Course {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  duration: number | null;
  rating: number | null;
  audienceLevel: string | null;
  deliveryMode: string | null;
  courseType: string | null;
  skillTags: string[];
  certification: boolean;
  trainer: { name: string } | null;
}

function CourseCard({ course }: { course: Course }) {
  const levelLabel = course.audienceLevel
    ? course.audienceLevel.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : null;

  const durationLabel = course.duration
    ? course.duration >= 40 ? `${Math.floor(course.duration / 40)} weeks` : `${course.duration} hrs`
    : null;

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 16px 32px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300"
    >
      {/* Top color band */}
      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">{course.name}</h3>
          {levelLabel && (
            <span className="shrink-0 text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
              {levelLabel}
            </span>
          )}
        </div>

        {course.shortDescription && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.shortDescription}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {durationLabel && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {durationLabel}
            </span>
          )}
          {course.rating && (
            <span className="flex items-center gap-1">
              <span className="text-amber-400">★</span>
              {course.rating.toFixed(1)}
            </span>
          )}
          {course.certification && (
            <span className="flex items-center gap-1 text-green-600">
              <Award className="w-3.5 h-3.5" />
              Certified
            </span>
          )}
        </div>

        {course.skillTags && course.skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(course.skillTags as string[]).slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <Link
            href={`/courses/${course.slug}`}
            className="flex-1 text-center text-sm font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          <Link
            href="/consult"
            className="text-sm font-semibold px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Enquire
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-2 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-8 bg-gray-200 rounded mt-6" />
      </div>
    </div>
  );
}

export function CourseRecommendations() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [activeTrack, setActiveTrack] = useState('Technology');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/courses?track=${activeTrack}&pageSize=6`)
      .then(r => r.json())
      .then(data => {
        setCourses(data.success ? data.courses : []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [activeTrack]);

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Recommended Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Curated courses across four learning tracks to match your growth goals
          </p>
        </motion.div>

        {/* Track Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TRACKS.map((track) => (
            <button
              key={track.key}
              onClick={() => setActiveTrack(track.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTrack === track.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>

        {/* Track description */}
        <p className="text-center text-sm text-gray-500 mb-8">
          {TRACKS.find(t => t.key === activeTrack)?.description}
        </p>

        {/* Course Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length > 0 ? (
          <motion.div
            key={activeTrack}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Courses coming soon for this track
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Contact us to learn more about our {TRACKS.find(t => t.key === activeTrack)?.label} programs
            </p>
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse All Courses
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
