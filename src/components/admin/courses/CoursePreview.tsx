'use client';

import { useState } from 'react';
import '@/styles/globals.css';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Edit3, BookOpen, Clock, Users, Star } from 'lucide-react';

interface CoursePreviewProps {
  courseData: any;
  isEditable?: boolean;
  onUpdate?: (data: any) => void;
}

const CoursePreview = ({ courseData, isEditable = false, onUpdate }: CoursePreviewProps) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { course, modules, lessons } = courseData;

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const startEditing = (field: string, currentValue: string) => {
    if (!isEditable) return;
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!onUpdate || !editingField) return;

    const [section, field] = editingField.split('.');
    const updatedData = { ...courseData };

    if (section === 'course') {
      updatedData.course = { ...updatedData.course, [field]: editValue };
    }

    onUpdate(updatedData);
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Group lessons by module
  const lessonsByModule = lessons.reduce((acc: any, lesson: any) => {
    if (!acc[lesson.moduleId]) {
      acc[lesson.moduleId] = [];
    }
    acc[lesson.moduleId].push(lesson);
    return acc;
  }, {});

  const totalLessons = lessons.length;
  const totalDuration = modules.reduce((sum: number, module: any) => sum + module.duration, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {editingField === 'course.name' ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="bg-white bg-opacity-20 border-none outline-none text-white placeholder-white placeholder-opacity-70 rounded px-2 py-1"
                    autoFocus
                  />
                ) : (
                  <span onClick={() => startEditing('course.name', course.name)}>
                    {course.name}
                    {isEditable && <Edit3 className="w-4 h-4 inline ml-2 opacity-70" />}
                  </span>
                )}
              </h1>
              <div className="flex items-center space-x-4 text-blue-100 text-sm">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration} hours</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{totalLessons} lessons</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{modules.length} modules</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="text-blue-100">Category</div>
              <div className="font-medium">{course.category?.replace('_', ' ')}</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="text-blue-100">Level</div>
              <div className="font-medium">{course.targetLevel}</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="text-blue-100">Price</div>
              <div className="font-medium">₹{course.price?.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-slate-600 leading-relaxed">
            {editingField === 'course.description' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={saveEdit}
                className="w-full border border-slate-200 rounded px-2 py-1 resize-none"
                rows={4}
                autoFocus
              />
            ) : (
              <span onClick={() => startEditing('course.description', course.description)}>
                {course.description}
                {isEditable && <Edit3 className="w-4 h-4 inline ml-2 opacity-70" />}
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Course Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
          <div className="text-slate-600">Modules</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{totalLessons}</div>
          <div className="text-slate-600">Lessons</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-orange-600">{totalDuration}</div>
          <div className="text-slate-600">Hours</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{course.skillTags?.length || 0}</div>
          <div className="text-slate-600">Skills</div>
        </div>
      </motion.div>

      {/* Skill Tags */}
      {course.skillTags && course.skillTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills Covered</h3>
          <div className="flex flex-wrap gap-2">
            {course.skillTags.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learning Objectives */}
      {course.learningObjectives && course.learningObjectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Learning Objectives</h3>
          <ul className="space-y-2">
            {course.learningObjectives.map((objective: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-slate-700">{objective}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Course Structure */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Course Structure</h3>
          <p className="text-slate-600 text-sm">
            {modules.length} modules • {totalLessons} lessons • {totalDuration} hours total
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {modules.map((module: any, moduleIndex: number) => {
            const moduleLessons = lessonsByModule[module.id] || [];
            const isExpanded = expandedModules.has(module.id);

            return (
              <div key={module.id} className="px-6 py-4">
                <div
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-6 px-6 py-2 rounded transition-colors"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-center space-x-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Module {moduleIndex + 1}: {module.title}
                      </h4>
                      <p className="text-sm text-slate-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <div>{moduleLessons.length} lessons</div>
                    <div>{module.duration} hours</div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 ml-8 space-y-2"
                  >
                    {moduleLessons.map((lesson: any, lessonIndex: number) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-800">
                            {lessonIndex + 1}
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-900">{lesson.title}</h5>
                            <p className="text-sm text-slate-600">{lesson.description}</p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration} min</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default CoursePreview;
