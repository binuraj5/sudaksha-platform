import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get('featured') === 'true';

    const batches = await prisma.offlineBatch.findMany({
      where: {
        isPublic: true,
        status: 'PUBLISHED',
        ...(featuredOnly ? { featuredOnHomepage: true } : {})
      },
      select: {
        id: true,
        slug: true,
        programTitle: true,
        programDescription: true,
        outcomes: true,
        skillsCovered: true,
        durationDays: true,
        durationHours: true,
        clientName: true,
        clientIndustry: true,
        clientSize: true,
        clientLogoUrl: true,
        showClientName: true,
        participantCount: true,
        startDate: true,
        endDate: true,
        deliveryMode: true,
        city: true,
        country: true,
        completionRate: true,
        satisfactionScore: true,
        certificationIssued: true,
        participantTestimonial: true,
        testimonialAuthor: true,
        testimonialDesig: true,
        coverImageUrl: true,
        featuredOnHomepage: true,
        createdAt: true,
        // STRICTLY EXCLUDING: clientContactName, clientContactEmail, clientContactPhone
      },
      orderBy: { startDate: 'desc' }
    });

    // Post-process to anonymize client details based on `showClientName` boolean
    const safeBatches = batches.map(batch => ({
      ...batch,
      clientName: batch.showClientName ? batch.clientName : 'Confidential Enterprise Client',
      clientLogoUrl: batch.showClientName ? batch.clientLogoUrl : null
    }));

    return NextResponse.json({ success: true, batches: safeBatches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
