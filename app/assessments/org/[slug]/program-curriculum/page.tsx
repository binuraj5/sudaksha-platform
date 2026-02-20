'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, BookOpen, Plus, AlertCircle, Loader2, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getLabelsForTenant } from '@/lib/tenant-labels';
import { useApi } from '@/hooks/use-api';
import { toast } from 'sonner';

interface CurricularHierarchy {
  departments: Department[];
  programs: Program[];
  courses: Course[];
  subjects: Subject[];
  topics: Topic[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  programs: Program[];
}

interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  courses: Course[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  programId: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  courseId: string;
  topics: Topic[];
  assignmentsCount?: number;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  subjectId: string;
  assessments?: Assessment[];
}

interface Assessment {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  totalQuestions: number;
}

export default function CurriculumManagementPage() {
  const params = useParams() as { slug: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hierarchy, setHierarchy] = useState<CurricularHierarchy | null>(null);
  const [labels, setLabels] = useState(getLabelsForTenant('INSTITUTION'));
  const [activeView, setActiveView] = useState<'departments' | 'program' | 'course' | 'subjects'>('departments');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { api } = useApi();

  useEffect(() => {
    loadCurriculumHierarchy();
  }, [params.slug]);

  const loadCurriculumHierarchy = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/org/${params.slug}/curriculum`);
      if (res.ok) {
        const data = await res.json();
        setHierarchy(data);
      } else {
        toast.error('Failed to load curriculum');
      }
    } catch (error) {
      toast.error('Error loading curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (courseId: string) => {
    try {
      const res = await api.post(`/api/org/${params.slug}/subjects`, {
        name: 'New Subject',
        code: generateSubjectCode(selectedCourse?.code),
        courseId,
      });
      if (res.ok) {
        toast.success('Subject added successfully');
        loadCurriculumHierarchy();
      }
    } catch (error) {
      toast.error('Failed to add subject');
    }
  };

  const handleAddTopic = async (subjectId: string) => {
    try {
      const res = await api.post(`/api/org/${params.slug}/topics`, {
        name: 'New Topic',
        subjectId,
        description: 'Topic for assessment linkage',
      });
      if (res.ok) {
        toast.success('Topic added successfully');
        loadCurriculumHierarchy();
      }
    } catch (error) {
      toast.error('Failed to add topic');
    }
  };

  const generateSubjectCode = (courseCode?: string): string => {
    return `${courseCode || 'SUBJ'}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  };

  const navigateToAssessment = (assessmentId: string) => {
    router.push(`/assessments/org/${params.slug}/admin/models/${assessmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading {labels.orgUnitPlural?.toLowerCase()} hierarchy...</span>
        </div>
      </div>
    );
  }

  if (!hierarchy?.departments.length) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No {labels.orgUnitPlural} Yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding {labels.orgUnitPlural?.toLowerCase()} to build your {labels.activityPlural?.toLowerCase()} structure.
              </p>
              <Button>
                Add Your First {labels.orgUnit || 'Department'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Home</span>
            <ChevronRight className="h-4 w-4" />
            <span>{labels.activityPlural || 'Programs'}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">Curriculum Management</span>
          </nav>
        </div>

        {/* Header & Program Selection */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {labels.activityPlural || 'Course'} Curriculum Management
            </h1>
            <p className="text-gray-600">
              Organize {labels.activityPlural?.toLowerCase() || 'courses'}, subjects, and topics for assessment assignments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Institution Mode: Junior Level Only
            </Badge>
          </div>
        </div>

        {/* Selection Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Departments Column */}
          <div className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{labels.orgUnitPlural || 'Departments'}</span>
                  <Badge variant="secondary" className="text-xs">
                    {hierarchy?.departments.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hierarchy?.departments.map(dept => (
                  <div key={dept.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{dept.name}</div>
                        <div className="text-xs text-gray-600">{dept.code}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {dept.programs?.length || 0} programs
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Programs Column */}
          <div className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Programs</span>
                  <Badge variant="secondary" className="text-xs">
                    {hierarchy?.programs?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hierarchy?.programs?.map(program => (
                  <div key={program.id} className="group">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 group-hover:bg-blue-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{program.name}</div>
                          <div className="text-xs text-gray-600">{program.code}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSubject(program.courses[0]?.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Subject
                        </Button>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {program.courses?.length || 0} courses
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Courses/Subjects Column */}
          <div className="space-y-4">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{labels.activityPlural || 'Courses'}</span>
                  <Badge variant="secondary" className="text-xs">
                    {hierarchy?.courses?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hierarchy?.courses?.map(course => (
                  <div key={course.id} className="border-l-2 border-green-300 pl-3">
                    <div className="mb-2">
                      <div className="font-medium text-sm text-gray-900">{course.name}</div>
                      <div className="text-xs text-gray-600">{course.code}</div>
                    </div>

                    {/* Subjects */}
                    <div className="space-y-2 ml-3">
                      {course.subjects?.map(subject => (
                        <div key={subject.id} className="p-2 rounded bg-amber-50 border border-amber-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3 w-3 text-amber-600" />
                              <span className="text-sm font-medium">{subject.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddTopic(subject.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Topics */}
                          {subject.topics?.map(topic => (
                            <div key={topic.id} className="pl-4 mb-1">
                              <div className="text-xs text-gray-700 font-medium">{topic.name}</div>
                              {topic.assessments && topic.assessments.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Linked: {topic.assessments.length} assessment{topic.assessments.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Add Subject Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleAddSubject(course.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Subject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Guidelines */}
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Curriculum Structure:</strong> Organize your {labels.activityPlural?.toLowerCase() || 'courses'} by department → program → {labels.activity?.toLowerCase() || 'course'} → subject → topic. Students will see assessments based on their program enrollment.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// API endpoint placeholder - would be created as actual route
// GET /api/org/[slug]/curriculum
// Returns aggregated hierarchy with assignments count