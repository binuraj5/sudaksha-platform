'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Users, 
  Calendar, 
  BookOpen, 
  Target,
  ArrowRight,
  X,
  Command
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: any;
  action: () => void;
  category: 'navigation' | 'action' | 'search';
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation Commands
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to admin dashboard',
      icon: Target,
      action: () => {
        window.location.href = '/admin';
        onClose();
      },
      category: 'navigation',
      keywords: ['home', 'main']
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View analytics and reports',
      icon: Target,
      action: () => {
        window.location.href = '/admin/analytics';
        onClose();
      },
      category: 'navigation',
      keywords: ['reports', 'stats']
    },
    {
      id: 'courses',
      title: 'Courses',
      description: 'Manage courses',
      icon: BookOpen,
      action: () => {
        window.location.href = '/admin/courses';
        onClose();
      },
      category: 'navigation',
      keywords: ['subjects', 'programs']
    },
    {
      id: 'batches',
      title: 'Batches',
      description: 'Manage course batches',
      icon: Calendar,
      action: () => {
        window.location.href = '/admin/batches';
        onClose();
      },
      category: 'navigation',
      keywords: ['schedule', 'classes']
    },
    {
      id: 'trainers',
      title: 'Trainers',
      description: 'Manage trainers',
      icon: Users,
      action: () => {
        window.location.href = '/admin/trainers';
        onClose();
      },
      category: 'navigation',
      keywords: ['instructors', 'teachers']
    },
    {
      id: 'students',
      title: 'Students',
      description: 'Manage students',
      icon: Users,
      action: () => {
        window.location.href = '/admin/students';
        onClose();
      },
      category: 'navigation',
      keywords: ['learners', 'participants']
    },

    // Action Commands
    {
      id: 'add-course',
      title: 'Add New Course',
      description: 'Create a new course',
      icon: Plus,
      action: () => {
        // Trigger modal for adding course
        onClose();
      },
      category: 'action',
      keywords: ['create', 'new', 'course']
    },
    {
      id: 'add-trainer',
      title: 'Add New Trainer',
      description: 'Create a new trainer',
      icon: Plus,
      action: () => {
        // Trigger modal for adding trainer
        onClose();
      },
      category: 'action',
      keywords: ['create', 'new', 'trainer', 'instructor']
    },
    {
      id: 'create-batch',
      title: 'Create New Batch',
      description: 'Schedule a new batch',
      icon: Plus,
      action: () => {
        // Trigger modal for creating batch
        onClose();
      },
      category: 'action',
      keywords: ['create', 'new', 'batch', 'schedule']
    }
  ];

  const filteredCommands = commands.filter(command => {
    const searchLower = query.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return <ArrowRight className="w-4 h-4 text-gray-400" />;
      case 'action': return <Plus className="w-4 h-4 text-gray-400" />;
      case 'search': return <Search className="w-4 h-4 text-gray-400" />;
      default: return <Command className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'action': return 'Actions';
      case 'search': return 'Search';
      default: return 'Other';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-gray-200">
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 outline-none text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm mt-2">Try different keywords</p>
            </div>
          ) : (
            <div>
              {['navigation', 'action', 'search'].map(category => {
                const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);
                if (categoryCommands.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                      {getCategoryLabel(category)}
                    </div>
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      const IconComponent = command.icon;

                      return (
                        <div
                          key={command.id}
                          onClick={() => command.action()}
                          className={`flex items-center p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center flex-1">
                            <div className="mr-3">
                              <IconComponent className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{command.title}</div>
                              {command.description && (
                                <div className="text-sm text-gray-500">{command.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {getCategoryIcon(command.category)}
                            {isSelected && (
                              <div className="ml-2 text-xs text-blue-600 font-medium">
                                ↵
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <div>
              Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+K</kbd> to open
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
