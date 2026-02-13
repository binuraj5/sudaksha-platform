import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/webinars/[id] - Get single webinar with registrations
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const webinar = await prisma.webinar.findUnique({
            where: { id: params.id },
            include: {
                registrations: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!webinar) {
            return NextResponse.json(
                { error: 'Webinar not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ webinar });
    } catch (error) {
        console.error('Error fetching webinar:', error);
        return NextResponse.json(
            { error: 'Failed to fetch webinar' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/webinars/[id] - Update webinar
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
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
            recordingUrl,
            status,
            maxAttendees,
            category,
            tags,
            featured,
        } = body;

        // Check if webinar exists
        const existing = await prisma.webinar.findUnique({
            where: { id: params.id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Webinar not found' },
                { status: 404 }
            );
        }

        // If slug is changing, check for conflicts
        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.webinar.findUnique({
                where: { slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: 'Slug already exists' },
                    { status: 400 }
                );
            }
        }

        const webinar = await prisma.webinar.update({
            where: { id: params.id },
            data: {
                title,
                slug,
                description,
                speaker,
                speakerBio,
                speakerImage,
                date: date ? new Date(date) : undefined,
                time,
                duration,
                timezone,
                imageUrl,
                meetingUrl,
                recordingUrl,
                status,
                maxAttendees,
                category,
                tags,
                featured,
            },
        });

        return NextResponse.json({ webinar });
    } catch (error) {
        console.error('Error updating webinar:', error);
        return NextResponse.json(
            { error: 'Failed to update webinar' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/webinars/[id] - Delete webinar
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        await prisma.webinar.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting webinar:', error);
        return NextResponse.json(
            { error: 'Failed to delete webinar' },
            { status: 500 }
        );
    }
}
