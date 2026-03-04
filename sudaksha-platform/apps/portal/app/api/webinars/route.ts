import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/webinars - Get webinars (public endpoint)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') || 'UPCOMING';

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }

        const webinars = await prisma.webinar.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                speaker: true,
                speakerImage: true,
                date: true,
                time: true,
                duration: true,
                timezone: true,
                imageUrl: true,
                status: true,
                registeredCount: true,
                maxAttendees: true,
                category: true,
                featured: true,
                recordingUrl: true,
            },
            orderBy: [
                { featured: 'desc' },
                { date: 'desc' },
            ],
        });

        return NextResponse.json({ webinars });
    } catch (error) {
        console.error('Error fetching webinars:', error);
        return NextResponse.json(
            { error: 'Failed to fetch webinars' },
            { status: 500 }
        );
    }
}
