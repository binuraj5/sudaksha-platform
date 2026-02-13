'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Calendar,
  DollarSign,
  Users,
  UserCheck,
} from 'lucide-react';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'course_created':
      return <BookOpen className="w-4 h-4 text-green-500" />;
    case 'batch_scheduled':
      return <Calendar className="w-4 h-4 text-blue-500" />;
    case 'student_enrolled':
      return <Users className="w-4 h-4 text-purple-500" />;
    case 'trainer_assigned':
      return <UserCheck className="w-4 h-4 text-orange-500" />;
    case 'payment_received':
      return <DollarSign className="w-4 h-4 text-green-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        type: 'course_created',
        message: 'New course "AI/ML Engineering" created by admin',
        time: '2 mins ago',
        user: 'Admin User',
      },
      {
        id: 2,
        type: 'batch_scheduled',
        message: 'Batch "Full Stack A" scheduled for Jan 15',
        time: '5 mins ago',
        user: 'John Doe',
      },
      {
        id: 3,
        type: 'student_enrolled',
        message: '15 students enrolled in "Data Science" batch',
        time: '12 mins ago',
        user: 'System',
      },
      {
        id: 4,
        type: 'trainer_assigned',
        message: 'Jane Smith assigned to "Java Spring" course',
        time: '1 hour ago',
        user: 'Admin User',
      },
      {
        id: 5,
        type: 'payment_received',
        message: 'Payment received for 3 course enrollments',
        time: '2 hours ago',
        user: 'System',
      },
    ];
    setActivities(mockActivities);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2 hover:bg-gray-100 rounded-lg transition inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.user}</span>
                    <span className="text-xs text-gray-400">
                      • {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
