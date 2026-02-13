import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackFormSubmission } from '@/lib/form-tracking';

// POST /api/webinars/[id]/register - Register for webinar
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { name, email, phone, company } = body;

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            );
        }

        // Check if webinar exists and is upcoming
        const webinar = await prisma.webinar.findUnique({
            where: { id: params.id },
        });

        if (!webinar) {
            return NextResponse.json(
                { error: 'Webinar not found' },
                { status: 404 }
            );
        }

        if (webinar.status !== 'UPCOMING') {
            return NextResponse.json(
                { error: 'Registration is closed for this webinar' },
                { status: 400 }
            );
        }

        // Check if already registered
        const existingRegistration = await prisma.webinarRegistration.findFirst({
            where: {
                webinarId: params.id,
                email,
            },
        });

        if (existingRegistration) {
            return NextResponse.json(
                { error: 'You are already registered for this webinar' },
                { status: 400 }
            );
        }

        // Check capacity
        if (webinar.maxAttendees && webinar.registeredCount >= webinar.maxAttendees) {
            return NextResponse.json(
                { error: 'This webinar is fully booked' },
                { status: 400 }
            );
        }

        // Create registration
        const registration = await prisma.webinarRegistration.create({
            data: {
                webinarId: params.id,
                name,
                email,
                phone,
                company,
            },
        });

        // Update registered count
        await prisma.webinar.update({
            where: { id: params.id },
            data: { registeredCount: { increment: 1 } },
        });

        // Track form submission
        await trackFormSubmission({
            formType: 'WEBINAR_REGISTRATION',
            formName: `Webinar: ${webinar.title}`,
            pageUrl: `/webinars/${webinar.slug}`,
            pageName: `Webinar Registration: ${webinar.title}`,
            formData: { name, email, phone, company, webinarId: params.id },
        });

        return NextResponse.json({
            success: true,
            registration,
            message: 'Successfully registered for the webinar'
        });
    } catch (error) {
        console.error('Error registering for webinar:', error);
        return NextResponse.json(
            { error: 'Failed to register for webinar' },
            { status: 500 }
        );
    }
}
