# Advanced Course Management Components

This directory contains advanced, reusable components for the course management system. All components are built with TypeScript, Tailwind CSS, and Framer Motion for smooth animations.

## 📁 Components Overview

### 1. AdvancedCourseFilters.tsx
**Purpose**: Comprehensive filtering system for courses with multiple filter options

**Features**:
- Search with real-time suggestions
- Category, Industry, Career Level filters
- Course Type and Delivery Mode filters
- Price Range and Duration filters
- Rating filters
- Special features (Popular, New, Placement, EMI)
- Expandable/collapsible sections
- Active filter count indicator

**Props**:
```typescript
interface AdvancedCourseFiltersProps {
  onFiltersChange: (filters: any) => void;
  initialFilters?: any;
}
```

**Usage**:
```tsx
import AdvancedCourseFilters from '@/components/courses/AdvancedCourseFilters';

const [filters, setFilters] = useState({});

<AdvancedCourseFilters
  onFiltersChange={setFilters}
  initialFilters={filters}
/>
```

---

### 2. CourseComparison.tsx
**Purpose**: Side-by-side comparison of multiple courses

**Features**:
- Compare up to 4 courses simultaneously
- Feature-by-feature comparison table
- Best value highlighting
- Expandable/collapsible feature sections
- Course cards with quick actions
- Add/remove courses dynamically

**Props**:
```typescript
interface CourseComparisonProps {
  courses: Course[];
  onRemoveCourse?: (courseId: string) => void;
  onAddCourse?: () => void;
}
```

**Usage**:
```tsx
import CourseComparison from '@/components/courses/CourseComparison';

<CourseComparison
  courses={selectedCourses}
  onRemoveCourse={(courseId) => removeFromComparison(courseId)}
  onAddCourse={() => setShowCourseSelector(true)}
/>
```

---

### 3. CourseEditor.tsx
**Purpose**: Create or edit course information with comprehensive form

**Features**:
- Multi-column form layout
- Real-time validation
- Image upload with preview
- Dynamic skill tags and learning objectives
- Preview mode
- Special features toggles
- Form state management
- Loading states

**Props**:
```typescript
interface CourseEditorProps {
  course?: Course;
  onSave: (course: Partial<Course>) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}
```

**Usage**:
```tsx
import CourseEditor from '@/components/courses/CourseEditor';

<CourseEditor
  mode="create"
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

---

### 4. CourseWishlist.tsx
**Purpose**: Manage saved/favorite courses with advanced features

**Features**:
- Grid/List view modes
- Search and filter wishlist
- Sort by name, price, rating, duration
- Add/remove from wishlist
- Share wishlist functionality
- Export to CSV
- Recent searches tracking
- Responsive design

**Props**:
```typescript
interface CourseWishlistProps {
  courses?: Course[];
  onCourseAction?: (action: string, courseId: string) => void;
}
```

**Usage**:
```tsx
import CourseWishlist from '@/components/courses/CourseWishlist';

<CourseWishlist
  courses={allCourses}
  onCourseAction={(action, courseId) => {
    console.log(`${action} course: ${courseId}`);
  }}
/>
```

---

### 5. SearchSuggestions.tsx
**Purpose**: Advanced search with intelligent suggestions

**Features**:
- Real-time search suggestions
- Recent searches tracking
- Trending searches
- Skill-based suggestions
- Category suggestions
- Keyboard navigation (arrows, enter, escape)
- Visual indicators for suggestion types
- Clear recent searches option

**Props**:
```typescript
interface SearchSuggestionsProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}
```

**Usage**:
```tsx
import SearchSuggestions from '@/components/courses/SearchSuggestions';

<SearchSuggestions
  onSearch={handleSearch}
  placeholder="Search courses, skills, or topics..."
  className="max-w-2xl mx-auto"
/>
```

## 🎨 Design System

### Colors
- Primary: Blue (`blue-600`)
- Secondary: Purple (`purple-600`) 
- Success: Green (`green-600`)
- Warning: Orange (`orange-600`)
- Error: Red (`red-600`)
- Neutral: Gray (`gray-600`)

### Typography
- Headings: `font-bold` with responsive sizing
- Body: `font-medium` for labels, `font-normal` for descriptions
- Small text: `text-sm` for metadata

### Spacing
- Component padding: `p-6` (24px)
- Section spacing: `space-y-6` (24px)
- Element spacing: `gap-3` (12px)

### Animations
- Page transitions: `fade` + `slide`
- Hover states: `scale` + `shadow`
- Loading states: `spin` for spinners
- Stagger animations: `delay` for list items

## 🔧 Integration Examples

### Enhanced Courses Page
```tsx
'use client';

import { useState } from 'react';
import AdvancedCourseFilters from '@/components/courses/AdvancedCourseFilters';
import SearchSuggestions from '@/components/courses/SearchSuggestions';

export default function EnhancedCoursesPage() {
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <SearchSuggestions
            onSearch={setSearchQuery}
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AdvancedCourseFilters
              onFiltersChange={setFilters}
              initialFilters={filters}
            />
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            {/* Your course grid component here */}
            <CourseGrid filters={{ ...filters, search: searchQuery }} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Course Management Dashboard
```tsx
'use client';

import { useState } from 'react';
import CourseEditor from '@/components/courses/CourseEditor';
import CourseComparison from '@/components/courses/CourseComparison';
import CourseWishlist from '@/components/courses/CourseWishlist';

export default function CourseManagementDashboard() {
  const [showEditor, setShowEditor] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonCourses, setComparisonCourses] = useState([]);

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowEditor(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create New Course
        </button>
        <button
          onClick={() => setShowComparison(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          Compare Courses
        </button>
      </div>

      {/* Modals */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CourseEditor
              mode="create"
              onSave={(course) => {
                // Handle save
                setShowEditor(false);
              }}
              onCancel={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {showComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Course Comparison</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <CourseComparison
                courses={comparisonCourses}
                onRemoveCourse={(courseId) => {
                  setComparisonCourses(prev => prev.filter(id => id !== courseId));
                }}
                onAddCourse={() => {
                  // Show course selector
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <CourseWishlist courses={allCourses} />
    </div>
  );
}
```

## 📱 Responsive Design

All components are fully responsive:
- **Mobile** (< 768px): Single column, stacked layouts
- **Tablet** (768px - 1024px): Two-column layouts where appropriate
- **Desktop** (> 1024px): Full multi-column layouts

## 🎯 Performance Considerations

1. **Lazy Loading**: Components use dynamic imports where appropriate
2. **Debouncing**: Search inputs are debounced for performance
3. **Virtual Scrolling**: Consider for large course lists
4. **Image Optimization**: Use Next.js Image component for course images
5. **State Management**: Local state with localStorage persistence

## 🔒 Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: WCAG AA compliant color combinations
- **Text Scaling**: Responsive to browser text size changes

## 🧪 Testing

Each component includes built-in validation and error handling:
- Form validation with visual feedback
- Error boundaries for graceful failures
- Loading states for async operations
- Empty states for better UX

## 📦 Dependencies

All components require:
- React 18+
- Framer Motion for animations
- Lucide React for icons
- Tailwind CSS for styling

Optional dependencies for enhanced functionality:
- Next.js Image component for optimization
- React Hook Form for advanced form handling
- Zustand/Redux for global state management
