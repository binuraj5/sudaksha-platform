import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testimonials = [
      {
        id: '1',
        name: 'Priya Sharma',
        photo: '/images/testimonials/priya.jpg',
        previousRole: 'B.Tech Graduate',
        currentRole: 'Full Stack Developer',
        salaryTransformation: '3 LPA → 8 LPA',
        companyLogo: '/images/companies/infosys.png',
        rating: 5,
        course: 'Full Stack Web Development',
        quote: 'Sudaksha transformed my career from a fresh graduate to a confident developer. The hands-on training and placement support were exceptional.'
      },
      {
        id: '2',
        name: 'Rahul Kumar',
        photo: '/images/testimonials/rahul.jpg',
        previousRole: 'Manual Tester',
        currentRole: 'Automation Engineer',
        salaryTransformation: '4 LPA → 9 LPA',
        companyLogo: '/images/companies/tcs.png',
        rating: 5,
        course: 'DevOps & Cloud Architecture',
        quote: 'The industry-aligned curriculum and expert trainers helped me switch careers seamlessly. I\'m now working on cutting-edge projects.'
      },
      {
        id: '3',
        name: 'Anjali Patel',
        photo: '/images/testimonials/anjali.jpg',
        previousRole: 'MBA Graduate',
        currentRole: 'Data Analyst',
        salaryTransformation: '2.5 LPA → 7 LPA',
        companyLogo: '/images/companies/wipro.png',
        rating: 4,
        course: 'Data Science Fundamentals',
        quote: 'Coming from a non-technical background, I was worried about the transition. Sudaksha\'s structured approach made it possible.'
      }
    ];

    return NextResponse.json(testimonials);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}
