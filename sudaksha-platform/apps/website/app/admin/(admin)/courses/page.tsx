'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Download, Sparkles } from 'lucide-react';
import { AICourseGenerator } from '@/components/admin/course-form/AICourseGenerator';
import AdminCourseForm from '@/components/courses/admin-course-form';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/courses?pageSize=100');
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCourse = async (courseData: Partial<any>) => {
    try {
      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...courseData } : c));
      } else {
        setCourses(prev => [...prev, { id: Date.now().toString(), ...courseData }]);
      }
      setShowAddForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleAIGeneratedCourse = (courseData: any) => {
    setEditingCourse(courseData);
    setShowAIGenerator(false);
    setShowAddForm(true);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  if (showAIGenerator) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">AI Course Generator</h1>
            <p className="text-gray-600 mt-1">Generate course content using AI</p>
          </div>
          <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
            Back to Courses
          </Button>
        </div>
        <AICourseGenerator onSuccess={handleAIGeneratedCourse} />
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{editingCourse ? 'Edit Course' : 'Add New Course'}</h1>
            <p className="text-gray-600 mt-1">{editingCourse ? 'Update course information' : 'Create a new course'}</p>
          </div>
          <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingCourse(null); }}>
            Back to Courses
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <AdminCourseForm
              course={editingCourse}
              onSave={handleSaveCourse}
              mode={editingCourse ? 'edit' : 'create'}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Courses Management</h1>
          <p className="text-gray-600 mt-1">Manage courses, content, and schedules</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            onClick={() => setShowAIGenerator(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with AI
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Total Courses</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{courses.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Published</p>
          <p className="text-xl font-bold text-green-600 mt-1">{courses.filter(c => c.isPublished).length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Drafts</p>
          <p className="text-xl font-bold text-orange-600 mt-1">{courses.filter(c => !c.isPublished).length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">With Trainers</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{courses.filter(c => c.trainer?.name).length}</p>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading courses...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Course Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Level</th>
                    <th className="text-left p-2">Trainer</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.slug}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{course.courseType ?? course.category ?? '—'}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{course.audienceLevel?.replace(/_/g, ' ') ?? '—'}</Badge>
                      </td>
                      <td className="p-2">
                        <span className="text-sm text-gray-600">{course.trainer?.name ?? '—'}</span>
                      </td>
                      <td className="p-2">
                        <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`/courses/${course.slug}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingCourse(course); setShowAddForm(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">No courses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
