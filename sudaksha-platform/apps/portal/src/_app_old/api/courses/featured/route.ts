import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from your database
    // For now, we'll return mock data
    const featuredCourses = [
      {
        id: '1',
        name: 'Full Stack Web Development',
        duration: 120,
        price: 49999,
        rating: 4.8,
        imageUrl: '/images/courses/full-stack.jpg',
        category: 'Software Development',
        level: 'INTERMEDIATE',
        description: 'Master modern web development with React, Node.js, and TypeScript'
      },
      {
        id: '2',
        name: 'Data Science Fundamentals',
        duration: 80,
        price: 39999,
        rating: 4.7,
        imageUrl: '/images/courses/data-science.jpg',
        category: 'Data & Analytics',
        level: 'BEGINNER',
        description: 'Learn the fundamentals of data science and machine learning'
      },
      {
        id: '3',
        name: 'Cloud Architecture with AWS',
        duration: 100,
        price: 44999,
        rating: 4.9,
        imageUrl: '/images/courses/aws.jpg',
        category: 'Cloud & DevOps',
        level: 'ADVANCED',
        description: 'Design and deploy scalable cloud solutions on AWS'
      },
      {
        id: '4',
        name: 'AI & Machine Learning',
        duration: 140,
        price: 59999,
        rating: 4.8,
        imageUrl: '/images/courses/ai-ml.jpg',
        category: 'AI/ML & Gen AI',
        level: 'ADVANCED',
        description: 'Deep dive into artificial intelligence and machine learning'
      },
      {
        id: '5',
        name: 'Cybersecurity Essentials',
        duration: 60,
        price: 34999,
        rating: 4.6,
        imageUrl: '/images/courses/cybersecurity.jpg',
        category: 'Cybersecurity',
        level: 'INTERMEDIATE',
        description: 'Learn essential cybersecurity skills and best practices'
      }
    ];

    return NextResponse.json({
      success: true,
      courses: featuredCourses,
      total: featuredCourses.length
    });
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch featured courses' },
      { status: 500 }
    );
  }
}
