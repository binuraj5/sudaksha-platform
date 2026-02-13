import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/webinars - List all webinars with filters
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured');

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (featured !== null) {
            where.featured = featured === 'true';
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { speaker: { contains: search, mode: 'insensitive' } },
            ];
        }

        const webinars = await prisma.webinar.findMany({
            where,
            include: {
                _count: {
                    select: { registrations: true },
                },
            },
            orderBy: [
                { featured: 'desc' },
                { date: 'desc' },
            ],
        });

        // Get stats
        const stats = {
            total: await prisma.webinar.count(),
            upcoming: await prisma.webinar.count({ where: { status: 'UPCOMING' } }),
            completed: await prisma.webinar.count({ where: { status: 'COMPLETED' } }),
            totalRegistrations: await prisma.webinarRegistration.count(),
        };

        return NextResponse.json({ webinars, stats });
    } catch (error) {
        console.error('Error fetching webinars:', error);
        return NextResponse.json(
            { error: 'Failed to fetch webinars' },
            { status: 500 }
        );
    }
}

// POST /api/admin/webinars - Create new webinar
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            title,
            slug,
            description,
            speaker,
            speakerBio,
            speakerImage,
            date,
            time,
            duration,
            timezone,
            imageUrl,
            meetingUrl,
            status,
            maxAttendees,
            category,
            tags,
            featured,
        } = body;

        // Validate required fields
        if (!title || !slug || !description || !speaker || !date || !time) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existing = await prisma.webinar.findUnique({
            where: { slug },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Slug already exists' },
                { status: 400 }
            );
        }

        const webinar = await prisma.webinar.create({
            data: {
                title,
                slug,
                description,
                speaker,
                speakerBio,
                speakerImage,
                date: new Date(date),
                time,
                duration: duration || 60,
                timezone: timezone || 'IST',
                imageUrl,
                meetingUrl,
                status: status || 'UPCOMING',
                maxAttendees,
                category,
                tags: tags || [],
                featured: featured || false,
            },
        });

        return NextResponse.json({ webinar }, { status: 201 });
    } catch (error) {
        console.error('Error creating webinar:', error);
        return NextResponse.json(
            { error: 'Failed to create webinar' },
            { status: 500 }
        );
    }
}
