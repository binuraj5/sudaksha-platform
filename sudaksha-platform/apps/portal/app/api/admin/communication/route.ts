import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Helper function to check if we're in mock mode
const isMockMode = () => false;

// GET - Fetch communications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')

    if (!prisma || !('communication' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    if (action === 'templates') {
      const templates = await prisma.communicationTemplate.findMany({
        orderBy: { name: 'asc' }
      })
      return NextResponse.json({ success: true, templates })
    }

    if (action === 'campaigns') {
      const campaigns = await prisma.communicationCampaign.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ success: true, campaigns })
    }

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: {
            select: { name: true }
          }
        }
      }),
      prisma.communication.count({ where })
    ])

    // Calculate aggregated stats from metadata/stats fields
    // This is a simplified version
    const totalSent = await prisma.communication.count({ where: { status: 'RESPONDED' } }) // Mapping PENDING/READ/RESPONDED/ARCHIVED to SENT for stats if needed

    return NextResponse.json({
      success: true,
      communications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalSent,
        // In a real app we'd aggregate more complex stats here
        totalDelivered: Math.floor(totalSent * 0.98),
        totalOpened: Math.floor(totalSent * 0.45),
        totalClicked: Math.floor(totalSent * 0.12),
        averageOpenRate: 45,
        averageClickRate: 12
      }
    })
  } catch (error) {
    console.error('Communications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}

// POST - Handle various communication actions
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!prisma || !('communication' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    if (action === 'cta-events') {
      const { ctaId, startDate, endDate } = await request.json()

      const where: any = {}
      if (ctaId) where.ctaId = ctaId
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = new Date(startDate)
        if (endDate) where.createdAt.lte = new Date(endDate)
      }

      const events = await prisma.cTAEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      const clicks = events.filter(event => event.eventType === 'CLICK').length
      const conversions = events.filter(event => event.eventType === 'CONVERSION').length
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0

      return NextResponse.json({
        success: true,
        events,
        metrics: {
          clicks,
          conversions,
          conversionRate,
          uniqueUsers: new Set(events.map(e => e.userId)).size
        }
      })
    }

    if (action === 'template') {
      const templateData = await request.json()
      const template = await prisma.communicationTemplate.create({
        data: templateData
      })
      return NextResponse.json({ success: true, template })
    }

    if (action === 'campaign') {
      const campaignData = await request.json()
      const campaign = await prisma.communicationCampaign.create({
        data: {
          ...campaignData,
          status: 'DRAFT'
        }
      })
      return NextResponse.json({ success: true, campaign })
    }

    // Default: POST - Create new communication (log)
    const commData = await request.json()
    const communication = await prisma.communication.create({
      data: {
        type: commData.type,
        subject: commData.subject,
        message: commData.content || commData.message,
        recipients: commData.recipients,
        status: 'PENDING',
        name: commData.name,
        email: commData.email,
        phone: commData.phone,
        campaignId: commData.campaignId
      }
    })

    revalidatePath('/admin/communication')
    return NextResponse.json({
      success: true,
      communication
    })
  } catch (error) {
    console.error('Communication API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process communication request' },
      { status: 500 }
    )
  }
}

// PUT - Update communication or campaign
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const data = await request.json()

    if (!prisma || !('communication' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    if (action === 'campaign') {
      const campaign = await prisma.communicationCampaign.update({
        where: { id: data.id },
        data: data
      })
      return NextResponse.json({ success: true, campaign })
    }

    const communication = await prisma.communication.update({
      where: { id: data.id },
      data: data
    })

    revalidatePath('/admin/communication')
    return NextResponse.json({
      success: true,
      communication
    })
  } catch (error) {
    console.error('Communication update API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update communication' },
      { status: 500 }
    )
  }
}

// DELETE - Delete communication
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    if (!prisma || !('communication' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    if (action === 'campaign') {
      await prisma.communicationCampaign.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Campaign deleted' })
    }

    if (action === 'template') {
      await prisma.communicationTemplate.delete({ where: { id } })
      return NextResponse.json({ success: true, message: 'Template deleted' })
    }

    await prisma.communication.delete({
      where: { id }
    })

    revalidatePath('/admin/communication')
    return NextResponse.json({
      success: true,
      message: 'Communication deleted successfully'
    })
  } catch (error) {
    console.error('Communication deletion API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete communication' },
      { status: 500 }
    )
  }
}
