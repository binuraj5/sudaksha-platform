import { NextRequest, NextResponse } from 'next/server'
import { getDashboardStats, getUpcomingBatches } from '../../../../src/lib/actions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5

    const [stats, batches] = await Promise.all([
      getDashboardStats(),
      getUpcomingBatches()
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats,
        batches
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
