'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, BookOpen, Inbox, Loader2 } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalRevenue: number;
    activeCourses: number;
    totalBatches: number;
    completionRate: number;
    totalLeads: number;
  };
  monthlyStats: { month: string; year: number; enrollments: number; revenue: number }[];
  topCourses: { id: string; name: string; enrollments: number; revenue: number }[];
  leadsByType: { type: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); else setError(d.error ?? 'Failed'); })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center py-24 text-gray-500 gap-2">
      <Loader2 className="h-6 w-6 animate-spin" /> Loading analytics...
    </div>
  );

  if (error) return (
    <div className="p-6 text-center text-red-500">Failed to load analytics: {error}</div>
  );

  const d = data!;
  const maxEnrollments = Math.max(...d.monthlyStats.map(s => s.enrollments), 1);
  const maxRevenue = Math.max(...d.monthlyStats.map(s => s.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Live data from your database</p>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Students', value: d.overview.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600' },
          { label: 'Total Revenue', value: d.overview.totalRevenue > 0 ? `₹${(d.overview.totalRevenue / 100000).toFixed(1)}L` : '₹0', icon: DollarSign, color: 'text-green-600' },
          { label: 'Active Courses', value: d.overview.activeCourses.toString(), icon: BookOpen, color: 'text-indigo-600' },
          { label: 'Active Batches', value: d.overview.totalBatches.toString(), icon: BarChart3, color: 'text-purple-600' },
          { label: 'Completion Rate', value: `${d.overview.completionRate}%`, icon: TrendingUp, color: 'text-orange-600' },
          { label: 'Total Leads', value: d.overview.totalLeads.toLocaleString(), icon: Inbox, color: 'text-pink-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Enrollments</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {d.monthlyStats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500 mb-1">{stat.enrollments || ''}</span>
                  <div
                    className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
                    style={{ height: `${(stat.enrollments / maxEnrollments) * 100}%`, minHeight: stat.enrollments > 0 ? '8px' : '2px' }}
                  />
                  <p className="text-xs mt-1 text-gray-600">{stat.month}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Revenue (₹)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {d.monthlyStats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500 mb-1">
                    {stat.revenue > 0 ? `₹${(stat.revenue / 1000).toFixed(0)}k` : ''}
                  </span>
                  <div
                    className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                    style={{ height: `${(stat.revenue / maxRevenue) * 100}%`, minHeight: stat.revenue > 0 ? '8px' : '2px' }}
                  />
                  <p className="text-xs mt-1 text-gray-600">{stat.month}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader><CardTitle className="text-base">Top Courses by Enrollment</CardTitle></CardHeader>
        <CardContent>
          {d.topCourses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No enrollment data yet.</p>
          ) : (
            <div className="space-y-3">
              {d.topCourses.map((course, i) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">{i + 1}</div>
                    <div>
                      <p className="font-medium text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500">{course.enrollments} enrolled</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{course.revenue > 0 ? `₹${(course.revenue / 100000).toFixed(1)}L` : '₹0'}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads by Type */}
      {d.leadsByType.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Form Submissions by Type</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {d.leadsByType.map(({ type, count }) => (
                <div key={type} className="flex items-center gap-2 bg-gray-50 border rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                  <span className="text-lg font-bold text-indigo-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
