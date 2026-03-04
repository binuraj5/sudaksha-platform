import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/types/course';

// Mock course data - in real app, this would come from database
const mockCourses: Course[] = [
  {
    id: '1',
    slug: 'full-stack-web-development',
    name: 'Full Stack Web Development',
    description: 'Master modern web development with React, Node.js, and TypeScript. Build scalable, production-ready applications from scratch.',
    shortDescription: 'Learn to build modern web applications using React, Node.js, and TypeScript',
    duration: 320,
    price: 49999,
    rating: 4.7,
    status: 'PUBLISHED' as any,
    audienceLevel: 'INTERMEDIATE' as any,
    category: 'SOFTWARE_DEVELOPMENT' as any,
    courseType: 'TECHNOLOGY' as any,
    targetLevel: 'MIDDLE' as any,
    industry: 'TECHNOLOGY' as any,
    categoryType: 'IT' as any,
    deliveryMode: 'ONLINE' as any,
    newDeliveryModes: ['ONLINE'] as any,
    learningOutcomes: [],
    instructors: [],
    includedFeatures: [],
    deliverables: [],
    prerequisites: '',
    curriculum: [],
    isSelfPaced: false,
    skillTags: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Redux'],
    learningObjectives: [
      'Build full-stack applications from scratch',
      'Master modern JavaScript frameworks',
      'Implement authentication and authorization',
      'Deploy applications to cloud platforms',
      'Work with databases and APIs',
      'Understand software architecture patterns'
    ],
    moduleBreakdown: {
      modules: [
        {
          id: '1',
          title: 'JavaScript Fundamentals',
          duration: 40,
          lessons: [
            { id: '1', title: 'Variables and Data Types', duration: 45 },
            { id: '2', title: 'Functions and Scope', duration: 60 },
            { id: '3', title: 'Async JavaScript', duration: 90 }
          ]
        },
        {
          id: '2',
          title: 'React Development',
          duration: 80,
          lessons: [
            { id: '1', title: 'Components and Props', duration: 60 },
            { id: '2', title: 'State Management', duration: 90 },
            { id: '3', title: 'Hooks and Effects', duration: 75 }
          ]
        }
      ]
    },
    imageUrl: undefined,
    language: 'English',
    certification: true,
    trainerId: '1',
    trainer: {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@sudaksha.com',
      bio: 'Senior Full Stack Developer with 10+ years of experience building scalable web applications. Passionate about teaching and mentoring developers.',
      expertise: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      experience: 10,
      rating: 4.9,
      imageUrl: undefined,
      status: 'ACTIVE' as any
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    batches: [
      {
        id: '1',
        name: 'Full Stack Batch 1',
        courseId: '1',
        trainerId: '1',
        startDate: '2024-02-01T09:00:00Z',
        endDate: '2024-05-01T18:00:00Z',
        mode: 'ONLINE' as any,
        maxStudents: 30,
        currentStudents: 25,
        price: 49999,
        status: 'ACTIVE' as any,
        schedule: 'Mon, Wed, Fri: 6:00 PM - 9:00 PM IST'
      }
    ],
    reviews: [
      {
        id: '1',
        courseId: '1',
        studentName: 'Sarah Johnson',
        studentEmail: 'sarah.johnson@email.com',
        rating: 5,
        comment: 'Excellent course! The instructor was very knowledgeable and the projects were practical.',
        createdAt: '2024-01-15T00:00:00Z',
        verified: true
      }
    ],
    placementRate: 92,
    isPopular: true,
    hasPlacementSupport: true,
    hasEMI: true,
    hasCorporateTraining: true,
    isNew: false,
    isFinishingSchool: false
  },
  {
    id: '2',
    slug: 'data-science-fundamentals',
    name: 'Data Science Fundamentals',
    description: 'Introduction to data science and machine learning. Learn Python, statistics, and data visualization to kickstart your data science career.',
    shortDescription: 'Learn the fundamentals of data science and machine learning',
    duration: 240,
    price: 39999,
    rating: 4.7,
    status: 'PUBLISHED' as any,
    audienceLevel: 'BEGINNER' as any,
    category: 'DATA_ANALYTICS' as any,
    courseType: 'TECHNOLOGY' as any,
    targetLevel: 'JUNIOR' as any,
    industry: 'GENERIC' as any,
    categoryType: 'IT' as any,
    deliveryMode: 'ONLINE' as any,
    newDeliveryModes: ['ONLINE'] as any,
    learningOutcomes: [],
    instructors: [],
    includedFeatures: [],
    deliverables: [],
    prerequisites: '',
    curriculum: [],
    isSelfPaced: false,
    skillTags: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization', 'Pandas', 'NumPy'],
    learningObjectives: [
      'Master Python for data science',
      'Understand statistical concepts',
      'Build machine learning models',
      'Create data visualizations',
      'Work with real datasets'
    ],
    moduleBreakdown: {
      modules: [
        {
          id: '1',
          title: 'Python Fundamentals for Data Science',
          duration: 60,
          lessons: [
            { id: '1', title: 'Introduction to Python', duration: 45 },
            { id: '2', title: 'Data Structures in Python', duration: 60 },
            { id: '3', title: 'Functions and Modules', duration: 45 }
          ]
        },
        {
          id: '2',
          title: 'Statistics and Probability',
          duration: 80,
          lessons: [
            { id: '1', title: 'Descriptive Statistics', duration: 60 },
            { id: '2', title: 'Probability Theory', duration: 75 },
            { id: '3', title: 'Hypothesis Testing', duration: 90 }
          ]
        },
        {
          id: '3',
          title: 'Machine Learning Basics',
          duration: 100,
          lessons: [
            { id: '1', title: 'Introduction to ML', duration: 60 },
            { id: '2', title: 'Supervised Learning', duration: 90 },
            { id: '3', title: 'Unsupervised Learning', duration: 75 }
          ]
        }
      ]
    },
    imageUrl: undefined,
    language: 'English',
    certification: true,
    trainerId: '2',
    trainer: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@sudaksha.com',
      bio: 'Data Science expert specializing in ML and AI with 8+ years of experience in building predictive models and analyzing complex datasets.',
      expertise: ['Python', 'Machine Learning', 'Statistics', 'TensorFlow', 'Scikit-learn'],
      experience: 8,
      rating: 4.8,
      imageUrl: undefined,
      status: 'ACTIVE' as any
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    batches: [
      {
        id: '2',
        name: 'Data Science Batch 1',
        courseId: '2',
        trainerId: '2',
        startDate: '2024-02-15T09:00:00Z',
        endDate: '2024-06-15T18:00:00Z',
        mode: 'ONLINE' as any,
        maxStudents: 25,
        currentStudents: 20,
        price: 39999,
        status: 'ACTIVE' as any,
        schedule: 'Tue, Thu, Sat: 6:00 PM - 9:00 PM IST'
      }
    ],
    reviews: [
      {
        id: '2',
        courseId: '2',
        studentName: 'Michael Chen',
        studentEmail: 'michael.chen@email.com',
        rating: 5,
        comment: 'Great introduction to data science! The hands-on projects were very helpful and the instructor explained complex concepts clearly.',
        createdAt: '2024-01-20T00:00:00Z',
        verified: true
      },
      {
        id: '3',
        courseId: '2',
        studentName: 'Emily Davis',
        studentEmail: 'emily.davis@email.com',
        rating: 4,
        comment: 'Comprehensive course covering all the fundamentals. The Python basics were especially well taught.',
        createdAt: '2024-01-25T00:00:00Z',
        verified: true
      }
    ],
    placementRate: 88,
    isPopular: true,
    hasPlacementSupport: true,
    hasEMI: true,
    hasCorporateTraining: false,
    isNew: false,
    isFinishingSchool: false
  },
  {
    id: '3',
    slug: 'cloud-architecture-aws',
    name: 'Cloud Architecture with AWS',
    description: 'Master AWS services and cloud architecture. Design and deploy scalable cloud solutions on AWS platform.',
    shortDescription: 'Design and deploy scalable cloud solutions on AWS',
    duration: 280,
    price: 44999,
    rating: 4.9,
    status: 'PUBLISHED' as any,
    audienceLevel: 'ADVANCED' as any,
    category: 'CLOUD_DEVOPS' as any,
    courseType: 'TECHNOLOGY' as any,
    targetLevel: 'SENIOR' as any,
    industry: 'TECHNOLOGY' as any,
    categoryType: 'IT' as any,
    deliveryMode: 'ONLINE' as any,
    newDeliveryModes: ['ONLINE'] as any,
    learningOutcomes: [],
    instructors: [],
    includedFeatures: [],
    deliverables: [],
    prerequisites: '',
    curriculum: [],
    isSelfPaced: false,
    skillTags: ['AWS', 'Cloud Computing', 'DevOps', 'Kubernetes', 'Docker', 'Terraform'],
    learningObjectives: [
      'Master AWS core services',
      'Design cloud architecture',
      'Implement DevOps practices',
      'Deploy containerized applications',
      'Optimize cloud costs'
    ],
    moduleBreakdown: {
      modules: [
        {
          id: '1',
          title: 'AWS Fundamentals',
          duration: 80,
          lessons: [
            { id: '1', title: 'Introduction to AWS', duration: 60 },
            { id: '2', title: 'AWS Global Infrastructure', duration: 45 },
            { id: '3', title: 'AWS Management Console', duration: 60 }
          ]
        },
        {
          id: '2',
          title: 'Compute and Storage Services',
          duration: 100,
          lessons: [
            { id: '1', title: 'EC2 Instances', duration: 90 },
            { id: '2', title: 'S3 Storage', duration: 75 },
            { id: '3', title: 'Lambda Functions', duration: 60 }
          ]
        },
        {
          id: '3',
          title: 'Advanced AWS Services',
          duration: 100,
          lessons: [
            { id: '1', title: 'RDS Databases', duration: 80 },
            { id: '2', title: 'VPC Networking', duration: 90 },
            { id: '3', title: 'CloudFormation', duration: 75 }
          ]
        }
      ]
    },
    imageUrl: undefined,
    language: 'English',
    certification: true,
    trainerId: '3',
    trainer: {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@sudaksha.com',
      bio: 'Cloud Architecture specialist with 12+ years of experience designing and implementing scalable cloud solutions on AWS and Azure.',
      expertise: ['AWS', 'Azure', 'DevOps', 'Kubernetes', 'Terraform'],
      experience: 12,
      rating: 4.9,
      imageUrl: undefined,
      status: 'ACTIVE' as any
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    batches: [
      {
        id: '3',
        name: 'AWS Cloud Architecture Batch 1',
        courseId: '3',
        trainerId: '3',
        startDate: '2024-03-01T09:00:00Z',
        endDate: '2024-07-01T18:00:00Z',
        mode: 'ONLINE' as any,
        maxStudents: 20,
        currentStudents: 15,
        price: 44999,
        status: 'ACTIVE' as any,
        schedule: 'Mon, Wed, Fri: 7:00 PM - 10:00 PM IST'
      }
    ],
    reviews: [
      {
        id: '4',
        courseId: '3',
        studentName: 'Robert Taylor',
        studentEmail: 'robert.taylor@email.com',
        rating: 5,
        comment: 'Excellent AWS course! The hands-on labs and real-world projects were invaluable. Mike is an amazing instructor.',
        createdAt: '2024-02-01T00:00:00Z',
        verified: true
      }
    ],
    placementRate: 95,
    isPopular: true,
    hasPlacementSupport: true,
    hasEMI: true,
    hasCorporateTraining: true,
    isNew: false,
    isFinishingSchool: false
  }
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Find course by ID or slug
    const course = mockCourses.find(c => c.id === id || c.slug === id);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
