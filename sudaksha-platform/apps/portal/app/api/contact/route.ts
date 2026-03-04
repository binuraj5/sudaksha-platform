import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema matching the contact form
const contactFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/),
  category: z.string().min(1),
  program: z.string().min(1),
  message: z.string().max(500).optional(),
  consent: z.boolean().refine(val => val === true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = contactFormSchema.parse(body);

    // Here you would typically:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Send notification to team
    // 4. Integrate with CRM

    // For now, we'll just log and return success
    console.log('Contact form submission:', {
      ...validatedData,
      submittedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, you might:
    // - Save to database using Prisma
    // - Send welcome email using service like SendGrid
    // - Create lead in CRM
    // - Send Slack notification to team

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      referenceId: `CF-${Date.now()}`, // Generate a reference ID
      expectedResponse: 'within 2 hours on working days'
    });

  } catch (error) {
    console.error('Contact form validation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Optional: Handle GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Contact API endpoint - POST only',
    schema: {
      name: 'string (2-50 chars)',
      email: 'string (valid email)',
      phone: 'string (valid Indian number)',
      category: 'string (fresher|professional|switcher|institution|corporate)',
      program: 'string (program slug)',
      message: 'string (optional, max 500 chars)',
      consent: 'boolean (must be true)'
    }
  });
}
