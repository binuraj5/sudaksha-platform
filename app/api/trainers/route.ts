import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/trainers
 * List trainers (id, name, email) for admin dropdowns
 */
export async function GET() {
  try {
    const trainers = await prisma.trainer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json({ success: true, data: trainers });
  } catch (error) {
    console.error("[TRAINERS] List error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trainers" },
      { status: 500 }
    );
  }
}
