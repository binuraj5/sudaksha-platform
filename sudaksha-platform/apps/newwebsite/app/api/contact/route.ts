import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  organisation?: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log to console for now — wire to email (Resend) later
    console.log('[Contact Form Submission]', {
      name: body.name,
      email: body.email,
      organisation: body.organisation ?? '—',
      subject: body.subject,
      message: body.message,
      timestamp: new Date().toISOString(),
    })

    // TODO: Integrate Resend or similar email service
    // const { data, error } = await resend.emails.send({
    //   from: process.env.EMAIL_FROM,
    //   to: process.env.EMAIL_TO,
    //   subject: `[Sudaksha Contact] ${subject} — ${name}`,
    //   html: `...`
    // })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Contact Form Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
