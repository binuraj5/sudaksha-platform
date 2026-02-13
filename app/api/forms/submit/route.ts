import { NextRequest, NextResponse } from 'next/server';
import { trackFormSubmission, getPageMetadata } from '@/lib/form-tracking';

// POST /api/forms/submit - Universal form submission endpoint
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { formType, formName, formData, pageUrl, pageName } = body;

        // Validate required fields
        if (!formType || !formData) {
            return NextResponse.json(
                { error: 'Missing required fields: formType, formData' },
                { status: 400 }
            );
        }

        // Get page metadata if not provided
        // Get page metadata if not provided
        const metadata = pageUrl
            ? { pageUrl: pageUrl as string, pageName: pageName as string | undefined }
            : await getPageMetadata(request.headers.get('referer'));

        // Track the submission
        const submission = await trackFormSubmission({
            formType,
            formName,
            pageUrl: metadata.pageUrl,
            pageName: metadata.pageName || formName,
            formData,
        });

        return NextResponse.json({
            success: true,
            submissionId: submission.id,
            message: 'Form submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting form:', error);
        return NextResponse.json(
            { error: 'Failed to submit form' },
            { status: 500 }
        );
    }
}
