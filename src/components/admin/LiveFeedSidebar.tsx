'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, BookOpen, Calendar, DollarSign, UserCheck, AlertTriangle, Clock } from 'lucide-react';

interface AuditLog {
  id: string;
  type: 'course_created' | 'batch_scheduled' | 'student_enrolled' | 'trainer_assigned' | 'payment_received' | 'conflict_detected' | 'user_login';
  message: string;
  user: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata?: {
    [key: string]: any;
  };
}

interface LiveFeedSidebarProps {
  className?: string;
}

export default function LiveFeedSidebar({ className = '' }: LiveFeedSidebarProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time audit logs
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        type: 'conflict_detected',
        message: 'Trainer John Doe double-booked for batches A and B on Monday',
        user: 'System',
        timestamp: '2 mins ago',
        severity: 'warning',
        metadata: { trainerId: '1', batchIds: ['A', 'B'] }
      },
      {
        id: '2',
        type: 'user_login',
        message: 'Admin User logged into admin panel',
        user: 'Admin User',
        timestamp: '5 mins ago',
        severity: 'info'
      },
      {
        id: '3',
        type: 'student_enrolled',
        message: '15 students enrolled in "Data Science" batch',
        user: 'System',
        timestamp: '12 mins ago',
        severity: 'success',
        metadata: { batchId: 'DS-001', studentCount: 15 }
      },
      {
        id: '4',
        type: 'trainer_assigned',
        message: 'Jane Smith assigned to "Java Spring" course',
        user: 'Admin User',
        timestamp: '1 hour ago',
        severity: 'info',
        metadata: { trainerId: '2', courseId: 'JS-001' }
      },
      {
        id: '5',
        type: 'payment_received',
        message: 'Payment received for 3 course enrollments',
        user: 'System',
        timestamp: '2 hours ago',
        severity: 'success',
        metadata: { amount: 135000, enrollments: 3 }
      },
      {
        id: '6',
        type: 'course_created',
        message: 'New course "AI/ML Engineering" created',
        user: 'Admin User',
        timestamp: '3 hours ago',
        severity: 'info',
        metadata: { courseId: 'AI-001' }
      },
      {
        id: '7',
        type: 'batch_scheduled',
        message: 'Batch "Full Stack A" scheduled for Jan 15',
        user: 'John Doe',
        timestamp: '4 hours ago',
        severity: 'info',
        metadata: { batchId: 'FS-001', startDate: '2024-01-15' }
      },
      {
        id: '8',
        type: 'user_login',
        message: 'Trainer Jane Smith logged into trainer portal',
        user: 'Jane Smith',
        timestamp: '5 hours ago',
        severity: 'info'
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setAuditLogs(mockAuditLogs);
      setIsLoading(false);
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newLog: AuditLog = {
        id: Date.now().toString(),
        type: 'user_login',
        message: `User activity detected at ${new Date().toLocaleTimeString()}`,
        user: 'System',
        timestamp: 'Just now',
        severity: 'info'
      };
      
      setAuditLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep only latest 10
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string, severity: string) => {
    const iconClass = "w-4 h-4";
    
    switch (type) {
      case 'course_created': return <BookOpen className={`${iconClass} text-blue-500`} />;
      case 'batch_scheduled': return <Calendar className={`${iconClass} text-green-500`} />;
      case 'student_enrolled': return <Users className={`${iconClass} text-purple-500`} />;
      case 'trainer_assigned': return <UserCheck className={`${iconClass} text-orange-500`} />;
      case 'payment_received': return <DollarSign className={`${iconClass} text-green-500`} />;
      case 'conflict_detected': return <AlertTriangle className={`${iconClass} text-red-500`} />;
      case 'user_login': return <Activity className={`${iconClass} text-gray-500`} />;
      default: return <Activity className={`${iconClass} text-gray-500`} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Live Activity Feed</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Live Activity Feed</h3>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {auditLogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getSeverityColor(log.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(log.type, log.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {log.message}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{log.user}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                  {log.metadata && (
                    <div className="mt-2 text-xs text-gray-600">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-1">
                          <span className="font-medium">{key}:</span>
                          <span>
                            {value instanceof Date 
                              ? value.toLocaleDateString() 
                              : typeof value === 'object' && value !== null
                                ? JSON.stringify(value)
                                : String(value)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View Full Audit Trail →
        </button>
      </div>
    </div>
  );
}
