'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Filter, Download, Sparkles, Globe, GlobeLock, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import { AICourseGenerator } from '@/components/admin/course-form/AICourseGenerator';
import AdminCourseForm from '@/components/courses/admin-course-form';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/courses');
      if (!res.ok) return;
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCourses = courses.filter(c => c.status !== 'ARCHIVED');
  const archivedCourses = courses.filter(c => c.status === 'ARCHIVED');

  const currentList = (activeTab === 'archived' ? archivedCourses : activeCourses).filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCourse = async (courseData: Partial<any>) => {
    try {
      const isEdit = !!editingCourse?.id && !editingCourse._aiGenerated;
      const url = isEdit ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to save course');
        return;
      }

      toast.success(isEdit ? 'Course updated successfully' : 'Course created successfully');
      setShowAddForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Unexpected error saving course');
    }
  };

  const handleAIGeneratedCourse = (courseData: any) => {
    // Mark as AI-generated so handleSaveCourse knows to use POST (not PUT)
    setEditingCourse({ ...courseData, _aiGenerated: true });
    setShowAIGenerator(false);
    setShowAddForm(true);
  };

  const handleArchiveCourse = async (courseId: string) => {
    if (!confirm('Archive this course? It will be hidden from the website but can be restored later.')) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Course archived');
        fetchCourses();
      } else {
        toast.error('Failed to archive course');
      }
    } catch {
      toast.error('Failed to archive course');
    }
  };

  const handlePublishToggle = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to update status');
        return;
      }
      toast.success(newStatus === 'PUBLISHED' ? 'Course published — now visible on website' : 'Course unpublished — hidden from website');
      fetchCourses();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleRestoreCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.error || 'Failed to restore course');
        return;
      }
      toast.success('Course restored to Drafts');
      fetchCourses();
    } catch {
      toast.error('Failed to restore course');
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
          <p className="text-xs font-medium text-gray-600">Active Courses</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{activeCourses.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Published</p>
          <p className="text-xl font-bold text-green-600 mt-1">{courses.filter(c => c.status === 'PUBLISHED').length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Drafts</p>
          <p className="text-xl font-bold text-orange-600 mt-1">{courses.filter(c => c.status === 'DRAFT').length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs font-medium text-gray-600">Archived</p>
          <p className="text-xl font-bold text-gray-500 mt-1">{archivedCourses.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active ({activeCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'archived' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Archived ({archivedCourses.length})
        </button>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'archived' ? 'Archived Courses' : 'All Courses'}</CardTitle>
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
                  {currentList.map((course) => (
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
                        <Badge
                          variant={course.status === 'PUBLISHED' ? 'default' : course.status === 'ARCHIVED' ? 'outline' : 'secondary'}
                          className={course.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 border-green-200' : course.status === 'ARCHIVED' ? 'text-gray-400' : ''}
                        >
                          {course.status ?? 'DRAFT'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 flex-wrap">
                          {activeTab === 'archived' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleRestoreCourse(course.id)}
                              title="Restore to Drafts"
                            >
                              <ArchiveRestore className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          ) : (
                            <>
                              {course.status === 'PUBLISHED' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                  onClick={() => handlePublishToggle(course.id, course.status)}
                                  title="Unpublish — hide from website"
                                >
                                  <GlobeLock className="h-4 w-4 mr-1" />
                                  Unpublish
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handlePublishToggle(course.id, course.status)}
                                  title="Publish — make visible on website"
                                >
                                  <Globe className="h-4 w-4 mr-1" />
                                  Publish
                                </Button>
                              )}
                              <Button size="sm" variant="outline" asChild title="Preview on website">
                                <a href={`/courses/${course.slug}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" title="Edit" onClick={async () => {
                                try {
                                  const res = await fetch(`/api/admin/courses/${course.id}`);
                                  const data = await res.json();
                                  if (data.success && data.course) {
                                    const c = data.course;
                                    setEditingCourse({
                                      ...c,
                                      durationHours: c.duration,
                                      curriculum: c.moduleBreakdown ?? [],
                                      domain: c.categoryType,
                                    });
                                  } else {
                                    setEditingCourse(course);
                                  }
                                } catch {
                                  setEditingCourse(course);
                                }
                                setShowAddForm(true);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                title="Archive course"
                                onClick={() => handleArchiveCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentList.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        {activeTab === 'archived' ? 'No archived courses' : 'No courses found'}
                      </td>
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
