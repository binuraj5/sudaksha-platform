import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from your database
    // For now, we'll return mock data
    const featuredCourses = [
      {
        id: '1',
        slug: 'full-stack-web-development',
        name: 'Full Stack Web Development',
        duration: 120,
        price: 49999,
        rating: 4.8,
        imageUrl: '/images/courses/full-stack.jpg',
        category: 'Software Development',
        level: 'INTERMEDIATE',
        description: 'Master modern web development with React, Node.js, and TypeScript',
        shortDescription: 'Learn to build modern web applications using React, Node.js, and TypeScript',
        skillTags: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        placementRate: 92,
        isPopular: true
      },
      {
        id: '2',
        slug: 'data-science-fundamentals',
        name: 'Data Science Fundamentals',
        duration: 80,
        price: 39999,
        rating: 4.7,
        imageUrl: '/images/courses/data-science.jpg',
        category: 'Data & Analytics',
        level: 'BEGINNER',
        description: 'Learn the fundamentals of data science and machine learning',
        shortDescription: 'Introduction to data science and machine learning with Python',
        skillTags: ['Python', 'Machine Learning', 'Statistics', 'Pandas'],
        placementRate: 88,
        isPopular: false
      },
      {
        id: '3',
        slug: 'cloud-architecture-aws',
        name: 'Cloud Architecture with AWS',
        duration: 100,
        price: 44999,
        rating: 4.9,
        imageUrl: '/images/courses/aws.jpg',
        category: 'Cloud & DevOps',
        level: 'ADVANCED',
        description: 'Design and deploy scalable cloud solutions on AWS',
        shortDescription: 'Master AWS services and cloud architecture',
        skillTags: ['AWS', 'Cloud Computing', 'DevOps', 'Docker'],
        placementRate: 95,
        isPopular: true
      },
      {
        id: '4',
        slug: 'ai-machine-learning',
        name: 'AI & Machine Learning',
        duration: 140,
        price: 59999,
        rating: 4.8,
        imageUrl: '/images/courses/ai-ml.jpg',
        category: 'AI/ML & Gen AI',
        level: 'ADVANCED',
        description: 'Deep dive into artificial intelligence and machine learning',
        shortDescription: 'Comprehensive AI and ML program with hands-on projects',
        skillTags: ['Python', 'TensorFlow', 'Neural Networks', 'Deep Learning'],
        placementRate: 90,
        isPopular: true
      },
      {
        id: '5',
        slug: 'cybersecurity-essentials',
        name: 'Cybersecurity Essentials',
        duration: 60,
        price: 34999,
        rating: 4.6,
        imageUrl: '/images/courses/cybersecurity.jpg',
        category: 'Cybersecurity',
        level: 'INTERMEDIATE',
        description: 'Learn essential cybersecurity skills and best practices',
        shortDescription: 'Essential cybersecurity skills for modern professionals',
        skillTags: ['Network Security', 'Ethical Hacking', 'Cryptography', 'SIEM'],
        placementRate: 85,
        isPopular: false
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
