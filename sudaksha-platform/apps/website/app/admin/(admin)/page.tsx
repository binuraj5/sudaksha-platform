import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Users, FileText, TrendingUp, ArrowRight, Clock } from 'lucide-react';

async function getStats() {
  try {
    const [courseCount, publishedCourseCount, submissionCount, enrollmentCount, recentSubmissions] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.formSubmission.count(),
      prisma.enrollment.count(),
      prisma.formSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          formType: true,
          formData: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return { courseCount, publishedCourseCount, submissionCount, enrollmentCount, recentSubmissions };
  } catch (e) {
    console.error('Admin dashboard stats error:', e);
    return { courseCount: 0, publishedCourseCount: 0, submissionCount: 0, enrollmentCount: 0, recentSubmissions: [] };
  }
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  href?: string;
  color: string;
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      {href && <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of Sudaksha platform activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Published Courses"
          value={stats.publishedCourseCount}
          sub={`${stats.courseCount} total`}
          icon={BookOpen}
          href="/admin/courses"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Form Submissions"
          value={stats.submissionCount}
          sub="Enrollments & inquiries"
          icon={FileText}
          href="/admin/enrollments"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Batch Enrollments"
          value={stats.enrollmentCount}
          sub="Confirmed seats"
          icon={Users}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Conversion"
          value={
            stats.submissionCount > 0
              ? `${Math.round((stats.enrollmentCount / stats.submissionCount) * 100)}%`
              : '—'
          }
          sub="Submissions → Enrolled"
          icon={TrendingUp}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Submissions</h2>
          <Link href="/admin/enrollments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>

        {stats.recentSubmissions.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500 text-sm">
            No submissions yet. Submissions from contact and enrollment forms will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentSubmissions.map((sub) => {
              const data = sub.formData as Record<string, any>;
              const name = [data?.firstName, data?.lastName].filter(Boolean).join(' ') || data?.name || data?.email || '—';
              const email = data?.email || '';
              return (
                <div key={sub.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {(name[0] || '?').toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                      {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full capitalize">
                      {sub.formType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        sub.status === 'converted'
                          ? 'bg-green-100 text-green-700'
                          : sub.status === 'contacted'
                          ? 'bg-blue-100 text-blue-700'
                          : sub.status === 'spam'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {sub.status.toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/enrollments"
          className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Enrollments</p>
            <p className="text-sm text-gray-500">View, filter, and update inquiry status</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>

        <Link
          href="/admin/courses"
          className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Manage Courses</p>
            <p className="text-sm text-gray-500">Add, edit, and publish course content</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
