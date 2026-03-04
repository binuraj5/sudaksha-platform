'use client';

import { useState, useEffect } from 'react';

interface DebugInfo {
  success: boolean;
  message?: string;
  error?: string;
  databaseInfo?: {
    connected: boolean;
    courseCount: number;
    trainerCount: number;
    recentCourses: Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      createdAt: string;
      moduleCount: number;
      trainerId: string;
      trainerName: string;
    }>;
  };
  courses?: any[];
  trainers?: any[];
  allCourseNames?: string[];
  allTrainerNames?: string[];
  databaseConnected?: boolean;
  prismaAvailable?: boolean;
}

interface ConnectionInfo {
  success: boolean;
  environment: {
    DATABASE_URL: string;
    NODE_ENV: string;
    NEXT_PUBLIC_API_URL: string;
    OPENAI_API_KEY: string;
    ANTHROPIC_API_KEY: string;
    PERPLEXITY_API_KEY: string;
  };
  prisma: {
    available: boolean;
    error?: string;
    keyCount: number;
  };
  database: {
    connected: boolean;
    error?: string;
  };
  recommendations: string[];
  error?: string;
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
    checkConnection();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/courses');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/debug/connection');
      const data = await response.json();
      setConnectionInfo(data);
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionInfo({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: {} as any,
        prisma: { available: false, keyCount: 0 },
        database: { connected: false },
        recommendations: ['Failed to check connection']
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Debug Info</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking database connection...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            {connectionInfo && (
              <div className={`p-6 rounded-lg border ${connectionInfo.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                <h2 className="text-xl font-semibold mb-4">
                  {connectionInfo.success ? '✅ Connection Check Complete' : '❌ Connection Issues Found'}
                </h2>

                {/* Environment Variables */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Environment Variables:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>DATABASE_URL:</strong> {connectionInfo.environment.DATABASE_URL}</p>
                    <p><strong>NODE_ENV:</strong> {connectionInfo.environment.NODE_ENV}</p>
                    <p><strong>OPENAI_API_KEY:</strong> {connectionInfo.environment.OPENAI_API_KEY}</p>
                    <p><strong>ANTHROPIC_API_KEY:</strong> {connectionInfo.environment.ANTHROPIC_API_KEY}</p>
                  </div>
                </div>

                {/* Prisma Status */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Prisma Client:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Available:</strong> {connectionInfo.prisma.available ? 'Yes' : 'No'}</p>
                    <p><strong>Key Count:</strong> {connectionInfo.prisma.keyCount}</p>
                    {connectionInfo.prisma.error && (
                      <p><strong>Error:</strong> {connectionInfo.prisma.error}</p>
                    )}
                  </div>
                </div>

                {/* Database Status */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Database Connection:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Connected:</strong> {connectionInfo.database.connected ? 'Yes' : 'No'}</p>
                    {connectionInfo.database.error && (
                      <p><strong>Error:</strong> {connectionInfo.database.error}</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {connectionInfo.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recommendations:</h3>
                    <div className="space-y-1">
                      {connectionInfo.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm">{rec}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Connection Status */}
            <div className={`p-6 rounded-lg border ${debugInfo?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
              <h2 className="text-xl font-semibold mb-4">
                {debugInfo?.success ? '✅ Database Connected' : '❌ Database Connection Failed'}
              </h2>

              {debugInfo?.success ? (
                <div className="space-y-2">
                  <p><strong>Status:</strong> {debugInfo.message}</p>
                  <p><strong>Prisma Available:</strong> {debugInfo.prismaAvailable ? 'Yes' : 'No'}</p>
                  <p><strong>Database Connected:</strong> {debugInfo.databaseConnected ? 'Yes' : 'No'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p><strong>Error:</strong> {debugInfo?.error}</p>
                  <p><strong>Prisma Available:</strong> {debugInfo?.prismaAvailable ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>

            {/* Course Count */}
            {debugInfo?.databaseInfo && (
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Database Statistics</h2>
                <div className="space-y-2">
                  <p><strong>Total Courses:</strong> {debugInfo.databaseInfo.courseCount}</p>
                  <p><strong>Total Trainers:</strong> {debugInfo.databaseInfo.trainerCount}</p>
                  <p><strong>Database Connected:</strong> {debugInfo.databaseInfo.connected ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}

            {/* Trainers */}
            {debugInfo?.trainers && debugInfo.trainers.length > 0 && (
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Available Trainers</h2>
                <div className="space-y-3">
                  {debugInfo.trainers.map((trainer) => (
                    <div key={trainer.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold">{trainer.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {trainer.id}</p>
                        <p><strong>Email:</strong> {trainer.email}</p>
                        <p><strong>Status:</strong> {trainer.status}</p>
                        <p><strong>Experience:</strong> {trainer.experience} years</p>
                        <p><strong>Rating:</strong> {trainer.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Courses */}
            {debugInfo?.databaseInfo?.recentCourses && debugInfo.databaseInfo.recentCourses.length > 0 && (
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
                <div className="space-y-3">
                  {debugInfo.databaseInfo.recentCourses.map((course) => (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold">{course.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {course.id}</p>
                        <p><strong>Slug:</strong> {course.slug}</p>
                        <p><strong>Status:</strong> {course.status}</p>
                        <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleString()}</p>
                        <p><strong>Modules:</strong> {course.moduleCount}</p>
                        <p><strong>Trainer ID:</strong> {course.trainerId}</p>
                        <p><strong>Trainer Name:</strong> {course.trainerName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Course Names */}
            {debugInfo?.allCourseNames && debugInfo.allCourseNames.length > 0 && (
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">All Course Names</h2>
                <div className="space-y-1">
                  {debugInfo.allCourseNames.map((name, index) => (
                    <p key={index} className="p-2 bg-gray-50 rounded">{index + 1}. {name}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  checkDatabase();
                  checkConnection();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Database Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
