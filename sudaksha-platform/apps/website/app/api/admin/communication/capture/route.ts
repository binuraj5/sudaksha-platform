import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const TEAM_EMAILS: Record<string, string> = {
  corporate:   'corporate@sudaksha.com',
  institution: 'institutions@sudaksha.com',
  individual:  'admissions@sudaksha.com',
  general:     'info@sudaksha.com',
};

/**
 * POST /api/admin/communication/capture
 *
 * Public endpoint (no auth required) called from:
 *  - CTA button clicks  → writes AuditLog only (action='CTA_CLICK')
 *  - Form submissions   → writes FormSubmission + AuditLog (action='FORM_SUBMIT')
 *
 * Body shape (all optional except ctaType):
 *  {
 *    ctaType: 'cta_click' | 'form_submit'   ← differentiator
 *    ctaLabel: string                         ← button label / form name
 *    sourcePage: string                       ← e.g. '/', '/individuals'
 *    intent: string                           ← 'counseling' | 'quote' | ...
 *    userType: string                         ← 'individual' | 'corporate' | ...
 *    name: string                             ← form field
 *    email: string                            ← form field
 *    phone: string                            ← form field
 *    message: string                          ← form field / notes
 *    [any other fields]
 *  }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      ctaType,
      ctaLabel,
      sourcePage = '/',
      intent,
      userType,
      name,
      email,
      phone,
      message,
      type,   // legacy field alias
      source, // legacy field alias
      ...rest
    } = body;

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0] ??
      req.headers.get('x-real-ip') ??
      undefined;
    const userAgent = req.headers.get('user-agent') ?? undefined;
    
    // Parse Vercel geo headers
    const city = req.headers.get('x-vercel-ip-city') ?? undefined;
    const country = req.headers.get('x-vercel-ip-country') ?? undefined;
    const region = req.headers.get('x-vercel-ip-country-region') ?? undefined;

    // Determine whether this is a form submission or a bare CTA click
    const isFormSubmit =
      ctaType === 'form_submit' ||
      type === 'form_submit' ||
      (!!name && !!email);

    // ── Form Submission path ─────────────────────────────────────────────────
    if (isFormSubmit) {
      const formData = {
        name: name ?? '',
        email: email ?? '',
        phone: phone ?? '',
        message: message ?? '',
        intent: intent ?? '',
        userType: userType ?? '',
        ctaLabel: ctaLabel ?? '',
        ...rest,
      };

      // 1. Persist to FormSubmission (shown in /admin/communication leads tab)
      const submission = await prisma.formSubmission.create({
        data: {
          formType:  intent ?? ctaLabel ?? 'GENERAL_INQUIRY',
          formName:  ctaLabel ?? null,
          pageUrl:   sourcePage ?? source ?? '/',
          pageName:  sourcePage ?? null,
          formData,
          ipAddress: ipAddress ?? null,
          userAgent: userAgent ?? null,
          status:    'NEW',
        },
      });

      // 2. Write audit log entry for the form submission
      await prisma.auditLog.create({
        data: {
          action:     'FORM_SUBMIT',
          entityType: 'FormSubmission',
          entityId:   submission.id,
          entityName: ctaLabel ?? intent ?? 'Website Form',
          details: {
            description: `Form submitted: "${ctaLabel ?? intent}" on ${sourcePage}`,
            name,
            email,
            phone,
            sourcePage,
            intent,
            userType,
          },
          severity:   'INFO',
          status:     'SUCCESS',
          userName:   name ?? 'website-visitor',
          userAgent:  userAgent ?? null,
          ipAddress:  ipAddress ?? null,
        },
      });

      // 3. Send email to correct team inbox
      try {
        const toEmail = TEAM_EMAILS[userType] || TEAM_EMAILS.general;
        const subjectLine = body.customData?.subjectLine || `New Lead: ${ctaLabel ?? intent}`;
        
        let htmlBody = `
          <h2>New Lead Capture: ${ctaLabel ?? intent}</h2>
          <p><strong>Name:</strong> ${name || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
          <hr/>
          <h3>Additional Context</h3>
          <pre>${JSON.stringify(body.customData || {}, null, 2)}</pre>
        `;

        await sendEmail(toEmail, subjectLine, htmlBody);
        
        // Log email sent success
        await prisma.auditLog.create({
          data: {
            action:     'EMAIL_SENT',
            entityType: 'FormSubmission',
            entityId:   submission.id,
            entityName: ctaLabel ?? intent ?? 'Website Form CTA',
            details: {
              description: `Email notified to ${toEmail}`,
              toEmail,
              subjectLine,
            },
            severity:   'INFO',
            status:     'SUCCESS',
            userName:   'system',
          },
        });
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr);
        // We do not fail the submission if email fails, but we log the error
         await prisma.auditLog.create({
          data: {
            action:     'EMAIL_FAILED',
            entityType: 'FormSubmission',
            entityId:   submission.id,
            entityName: ctaLabel ?? intent ?? 'Website Form CTA',
            details: {
              description: `Failed to notify email queue`,
              error: String(emailErr)
            },
            severity:   'ERROR',
            status:     'FAILED',
            userName:   'system',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Form captured',
        id: submission.id,
      });
    }

    // ── CTA Click path (no personal data) ───────────────────────────────────
    await prisma.auditLog.create({
      data: {
        action:     'CTA_CLICK',
        entityType: 'WebsiteCTA',
        entityName: ctaLabel ?? type ?? 'Unknown CTA',
        details: {
          description: `CTA clicked: "${ctaLabel ?? type}" on ${sourcePage}`,
          ctaLabel: ctaLabel ?? type,
          sourcePage: sourcePage ?? source,
          intent,
          userType,
          city,
          country,
          region,
          ...rest,
        },
        severity:   'INFO',
        status:     'SUCCESS',
        userName:   'website-visitor',
        userAgent:  userAgent ?? null,
        ipAddress:  ipAddress ?? null,
      },
    });

    return NextResponse.json({ success: true, message: 'CTA click captured' });
  } catch (error: any) {
    console.error('[capture] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Failed to process capture' },
      { status: 500 },
    );
  }
}
