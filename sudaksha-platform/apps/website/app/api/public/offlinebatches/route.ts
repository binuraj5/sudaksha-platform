import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6');
    const isPublic = searchParams.get('isPublic') === 'true';
    const debug = searchParams.get('debug') === 'true';

    const batches = await prisma.offlineBatch.findMany({
      where: isPublic ? { isPublic: true, status: 'PUBLISHED' } : {},
      orderBy: { startDate: 'desc' },
      take: limit,
    });

    // Debug endpoint to check visibility
    if (debug) {
      const allBatches = await prisma.offlineBatch.findMany({
        select: {
          id: true,
          programTitle: true,
          status: true,
          isPublic: true,
          slug: true,
        },
        orderBy: { createdAt: 'desc' }
      });
      
      const visible = allBatches.filter(b => b.status === 'PUBLISHED' && b.isPublic);
      const hidden = allBatches.filter(b => !(b.status === 'PUBLISHED' && b.isPublic));

      return NextResponse.json({
        success: true,
        debug: true,
        visibleCount: visible.length,
        hiddenCount: hidden.length,
        visible,
        hidden,
        message: `To appear on /our-work, programs need: status='PUBLISHED' AND isPublic=true`
      });
    }

    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
