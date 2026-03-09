import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formType, formName, formData, pageUrl, pageName } = body;

    if (!formType || !pageUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Capture IP — respect proxy headers
    const rawIp = req.headers.get("x-forwarded-for") ||
                  req.headers.get("x-real-ip") ||
                  "unknown";
    const ipAddress = rawIp.split(",")[0].trim();
    const userAgent = req.headers.get("user-agent") || null;

    // Enrich formData with server-captured metadata
    const enrichedFormData = {
      ...(typeof formData === "object" && formData !== null ? formData : {}),
      _meta: {
        capturedIp: ipAddress,
        userAgent,
        submittedAt: new Date().toISOString(),
        // client-side geo/device passed from browser in formData.location / formData.device
      },
    };

    const submission = await prisma.formSubmission.create({
      data: {
        formType: formType || "UNKNOWN",
        formName: formName || null,
        pageUrl: pageUrl || "",
        pageName: pageName || null,
        formData: enrichedFormData,
        userAgent,
        ipAddress,
        status: "NEW",
        notes: JSON.stringify([]), // empty thread
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error: any) {
    console.error("Form submission error:", error);
    return NextResponse.json({ success: false, error: "Failed to save submission" }, { status: 500 });
  }
}
