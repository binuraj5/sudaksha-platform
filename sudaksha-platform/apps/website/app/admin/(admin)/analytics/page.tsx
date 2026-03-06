'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, DollarSign, BookOpen } from 'lucide-react';

const analytics = {
  overview: { totalRevenue: 2450000, totalStudents: 1250, totalCourses: 45, completionRate: 87.5 },
  monthlyStats: [
    { month: 'Jan', revenue: 450000, students: 180 },
    { month: 'Feb', revenue: 520000, students: 220 },
    { month: 'Mar', revenue: 480000, students: 195 },
    { month: 'Apr', revenue: 610000, students: 265 },
    { month: 'May', revenue: 390000, students: 165 },
    { month: 'Jun', revenue: 0, students: 0 },
  ],
  topCourses: [
    { name: 'Full Stack Web Development', students: 245, revenue: 11025000 },
    { name: 'Cloud Computing with AWS', students: 189, revenue: 6615000 },
    { name: 'Cybersecurity Fundamentals', students: 156, revenue: 6240000 },
    { name: 'Data Science with Python', students: 134, revenue: 5360000 },
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(analytics.overview.totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.completionRate}%</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.monthlyStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-indigo-600 rounded-t hover:bg-indigo-700 transition-colors"
                    style={{ height: `${(stat.revenue / 610000) * 100}%`, minHeight: stat.revenue > 0 ? '20px' : '0' }}
                  />
                  <div className="text-xs mt-2 text-center">
                    <div>{stat.month}</div>
                    <div className="text-gray-500">₹{(stat.revenue / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.monthlyStats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors"
                    style={{ height: `${(stat.students / 265) * 100}%`, minHeight: stat.students > 0 ? '20px' : '0' }}
                  />
                  <div className="text-xs mt-2 text-center">
                    <div>{stat.month}</div>
                    <div className="text-gray-500">{stat.students}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-gray-500">{course.students} students enrolled</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{(course.revenue / 100000).toFixed(1)}L</div>
                  <div className="text-sm text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Average Course Rating</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">4.8 ⭐</div>
            <p className="text-sm text-gray-600">Based on 1,250 reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Student Satisfaction</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">92%</div>
            <p className="text-sm text-gray-600">Would recommend to others</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Course Completion</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">87.5%</div>
            <p className="text-sm text-gray-600">Average completion rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
