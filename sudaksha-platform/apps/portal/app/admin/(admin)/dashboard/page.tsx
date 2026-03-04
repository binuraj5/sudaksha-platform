'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  TrendingUp,
  Zap,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
  overview: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalFormSubmissions: number;
    totalBatches: number;
    activeBatches: number;
    aiCoursesGenerated: number;
  };
  enrollmentFunnel: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    conversionRate: string;
  };
  submissionsByType: Array<{ type: string; count: number }>;
  coursesByIndustry: Array<{ name: string; count: number }>;
  crmSync: {
    successful: number;
    pending: number;
    failed: number;
    successRate: string;
  };
  aiGeneration: {
    completedGenerations: number;
    failedGenerations: number;
    totalTokensUsed: number;
    totalCostUSD: string;
    avgTokensPerCourse: number;
  };
  batchMetrics: {
    total: number;
    active: number;
    totalCapacity: number;
    totalEnrolled: number;
    occupancyRate: string;
  };
  monthlyTrend: Array<{ date: string; submissions: number }>;
  recentActivity: {
    submissions: any[];
    courses: any[];
    aiGenerations: any[];
  };
}

interface MetricCard {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const StatCard = ({ metric }: { metric: MetricCard }) => {
  const Icon = metric.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
          <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
          {metric.change && (
            <p className="text-xs text-green-600 mt-2">{metric.change}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${metric.color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const defaultData: DashboardData = {
  overview: {
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalFormSubmissions: 0,
    totalBatches: 0,
    activeBatches: 0,
    aiCoursesGenerated: 0,
  },
  enrollmentFunnel: {
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    conversionRate: '0%',
  },
  submissionsByType: [],
  coursesByIndustry: [],
  crmSync: { successful: 0, pending: 0, failed: 0, successRate: '0%' },
  aiGeneration: {
    completedGenerations: 0,
    failedGenerations: 0,
    totalTokensUsed: 0,
    totalCostUSD: '0',
    avgTokensPerCourse: 0,
  },
  batchMetrics: {
    total: 0,
    active: 0,
    totalCapacity: 0,
    totalEnrolled: 0,
    occupancyRate: '0%',
  },
  monthlyTrend: [],
  recentActivity: { submissions: [], courses: [], aiGenerations: [] },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard?days=30');
        if (response.ok) {
          const result = await response.json();
          setData(result.data ?? defaultData);
        } else {
          setData(defaultData);
        }
      } catch {
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-900">Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const d = data ?? defaultData;

  const metrics: MetricCard[] = [
    {
      label: 'Total Courses',
      value: d.overview.totalCourses,
      change: `${d.overview.publishedCourses} published`,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Submissions',
      value: d.overview.totalFormSubmissions,
      change: `${d.enrollmentFunnel.converted} converted`,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      label: 'Conversion Rate',
      value: d.enrollmentFunnel.conversionRate,
      change: `${d.enrollmentFunnel.converted} conversions`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'AI Courses',
      value: d.overview.aiCoursesGenerated,
      change: `${d.aiGeneration.totalCostUSD} spent`,
      icon: Zap,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <StatCard key={idx} metric={metric} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Enrollment Funnel</h3>
          <div className="space-y-4">
            {[
              { label: 'New Submissions', value: d.enrollmentFunnel.new, color: 'bg-blue-100' },
              { label: 'Contacted', value: d.enrollmentFunnel.contacted, color: 'bg-yellow-100' },
              { label: 'Converted', value: d.enrollmentFunnel.converted, color: 'bg-green-100' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: `${d.enrollmentFunnel.total ? (item.value / d.enrollmentFunnel.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">CRM Sync Status</h3>
          <div className="space-y-4">
            {[
              { label: 'Successful', value: d.crmSync.successful, color: 'bg-green-500' },
              { label: 'Pending', value: d.crmSync.pending, color: 'bg-yellow-500' },
              { label: 'Failed', value: d.crmSync.failed, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <p className="text-sm text-gray-600">
                Success Rate: <span className="font-semibold">{d.crmSync.successRate}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Recent Form Submissions</h3>
        {d.recentActivity.submissions.length === 0 ? (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {d.recentActivity.submissions.map((submission: any) => (
                  <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {submission.firstName} {submission.lastName}
                    </td>
                    <td className="py-3 px-4">{submission.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {String(submission.type).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded ${
                          submission.status === 'new'
                            ? 'bg-yellow-100 text-yellow-800'
                            : submission.status === 'contacted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {submission.createdAt
                        ? new Date(submission.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
