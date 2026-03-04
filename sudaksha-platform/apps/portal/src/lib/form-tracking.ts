import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { InputJsonValue } from '@prisma/client/runtime/library';

export interface FormSubmissionData {
    formType: string;
    formName?: string;
    pageUrl: string;
    pageName?: string;
    formData: Record<string, any>;
}

/**
 * Track form submission to database
 */
export async function trackFormSubmission(data: FormSubmissionData) {
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || 'Unknown';
        const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown';

        // Create the form submission record
        const submission = await prisma.formSubmission.create({
            data: {
                formType: data.formType,
                formName: data.formName || data.formType,
                pageUrl: data.pageUrl,
                pageName: data.pageName,
                formData: data.formData as unknown as InputJsonValue,
                userAgent,
                ipAddress: Array.isArray(ip) ? ip[0] : ip,
                status: 'NEW',
            },
        });

        // If this is a contact form, demo request, or enroll inquiry, also create a Communication record
        if (['CONTACT', 'DEMO', 'GLOBAL_CTA'].includes(data.formType)) {
            // Determine communication type
            let commType: any = 'OTHER'; // Default to OTHER if mapping fails or type is new

            if (data.formType === 'CONTACT') commType = 'CONTACT_FORM';
            else if (data.formType === 'DEMO' || data.formType === 'GLOBAL_CTA') commType = 'ENROLLMENT_INQUIRY';

            // Extract common fields from formData
            const formData = data.formData;
            const email = formData.email || null;
            const name = formData.name || formData.fullName || null;
            const phone = formData.phone || formData.phoneNumber || null;
            const message = formData.message || '';
            const subject = formData.subject || `New ${data.formType} Submission`;

            await prisma.communication.create({
                data: {
                    type: commType,
                    subject: subject,
                    message: message || 'No message provided',
                    email: email,
                    name: name,
                    phone: phone,
                    status: 'PENDING',
                    metadata: {
                        source: 'form_submission',
                        formSubmissionId: submission.id,
                        pageUrl: data.pageUrl,
                        ...((data.formType === 'GLOBAL_CTA') ? { ctaData: data.formData } : {})
                    }
                }
            });
        }

        return submission;
    } catch (error) {
        console.error('Error tracking form submission:', error);
        throw error;
    }
}

/**
 * Track CTA button click
 */
export async function trackCTAClick(data: {
    ctaId: string;
    buttonName?: string;
    pageUrl?: string;
    formName?: string;
    eventData?: Record<string, any>;
}) {
    try {
        const headersList = headers();
        const userAgent = (await headersList).get('user-agent') || undefined;

        await prisma.cTAEvent.create({
            data: {
                ctaId: data.ctaId,
                eventType: 'CLICK',
                buttonName: data.buttonName,
                pageUrl: data.pageUrl,
                formName: data.formName,
                eventData: data.eventData,
            },
        });
    } catch (error) {
        console.error('Error tracking CTA click:', error);
    }
}

/**
 * Extract page metadata from request
 */
export async function getPageMetadata(referer?: string | null): Promise<{ pageUrl: string; pageName?: string; }> {
    const headersList = headers();
    const pageUrl = referer || (await headersList).get('referer') || 'unknown';

    let pageName: string | undefined;
    if (pageUrl && pageUrl !== 'unknown') {
        try {
            const url = new URL(pageUrl);
            const pathname = url.pathname;

            // Convert pathname to readable name
            if (pathname === '/') {
                pageName = 'Home';
            } else {
                pageName = pathname
                    .split('/')
                    .filter(Boolean)
                    .map(part => part.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' '))
                    .join(' > ');
            }
        } catch {
            pageName = undefined;
        }
    }

    return { pageUrl, pageName };
}
