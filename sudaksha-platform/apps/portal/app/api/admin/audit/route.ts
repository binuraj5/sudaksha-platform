import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock audit logs
const mockAuditLogs = [
  {
    id: 'audit-1',
    userId: 'admin-1',
    userName: 'Admin User',
    action: 'CREATE_COURSE',
    details: 'Created new course "Advanced React Development"',
    entityType: 'Course',
    entityId: 'course-123',
    entityName: 'Advanced React Development',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T10:30:00Z',
    severity: 'INFO',
    status: 'SUCCESS'
  },
  {
    id: 'audit-2',
    userId: 'trainer-1',
    userName: 'John Smith',
    action: 'UPDATE_BATCH',
    details: 'Updated batch schedule for "Full Stack Development - Batch A"',
    entityType: 'Batch',
    entityId: 'batch-456',
    entityName: 'Full Stack Development - Batch A',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-15T11:15:00Z',
    severity: 'INFO',
    status: 'SUCCESS'
  },
  {
    id: 'audit-3',
    userId: 'student-123',
    userName: 'Student User',
    action: 'LOGIN',
    details: 'Student login attempt',
    entityType: 'User',
    entityId: 'student-123',
    entityName: 'Student User',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    timestamp: '2024-01-15T12:00:00Z',
    severity: 'INFO',
    status: 'SUCCESS'
  },
  {
    id: 'audit-4',
    userId: 'admin-1',
    userName: 'Admin User',
    action: 'DELETE_COURSE',
    details: 'Deleted course "Old JavaScript Course"',
    entityType: 'Course',
    entityId: 'course-789',
    entityName: 'Old JavaScript Course',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T14:30:00Z',
    severity: 'WARNING',
    status: 'SUCCESS'
  },
  {
    id: 'audit-5',
    userId: 'unknown',
    userName: 'Unknown User',
    action: 'LOGIN_FAILED',
    details: 'Failed login attempt - invalid credentials',
    entityType: 'User',
    entityId: null,
    entityName: null,
    ipAddress: '192.168.1.250',
    userAgent: 'Mozilla/5.0 (compatible; scanner/1.0)',
    timestamp: '2024-01-15T15:45:00Z',
    severity: 'ERROR',
    status: 'FAILED'
  }
]

const isMockMode = () => false;

// GET - Fetch audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const severity = searchParams.get('severity')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    if (!prisma || !('auditLog' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    const where: any = {}

    if (action) where.action = action
    if (severity) where.severity = severity

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { details: { path: [], equals: search } }, // Prisma Json search is a bit more complex, using simple containment for string fields mostly
        { entityName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [todayCount, errorCount, warningCount] = await Promise.all([
      prisma.auditLog.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.auditLog.count({ where: { severity: 'ERROR' } }),
      prisma.auditLog.count({ where: { severity: 'WARNING' } })
    ])

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalLogs: total,
        todayLogs: todayCount,
        errorLogs: errorCount,
        warningLogs: warningCount
      }
    })

  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

// POST - Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const auditData = await request.json()

    if (!prisma || !('auditLog' in prisma)) {
      return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: auditData.userId,
        userName: auditData.userName,
        action: auditData.action,
        details: auditData.details,
        entityType: auditData.entityType,
        entityId: auditData.entityId,
        entityName: auditData.entityName,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        severity: auditData.severity || 'INFO',
        status: auditData.status || 'SUCCESS'
      }
    })

    return NextResponse.json({
      success: true,
      log
    })
  } catch (error) {
    console.error('Audit log creation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create audit log' },
      { status: 500 }
    )
  }
}
