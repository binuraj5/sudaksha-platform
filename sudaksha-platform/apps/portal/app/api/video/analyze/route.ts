import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { analyzeVideoPython } from "@/lib/python-api";

/**
 * POST /api/video/analyze
 * Proxies to Python backend. Body: FormData with "video" file.
 * Query or body: competencyName, targetLevel
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getApiSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const video = formData.get("video");
        const competencyName = (formData.get("competencyName") as string) || req.nextUrl.searchParams.get("competency_name") || "";
        const targetLevel = (formData.get("targetLevel") as string) || req.nextUrl.searchParams.get("target_level") || "";

        if (!video || !(video instanceof Blob)) {
            return NextResponse.json({ error: "Missing video file" }, { status: 400 });
        }
        if (!competencyName || !targetLevel) {
            return NextResponse.json(
                { error: "competencyName and targetLevel are required" },
                { status: 400 }
            );
        }

        const file = video instanceof File ? video : new File([video], "video.webm", { type: (video as any).type });
        const result = await analyzeVideoPython({
            videoFile: file,
            competencyName,
            targetLevel,
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Video analyze error:", error);
        const isServiceDown =
            (error as any)?.cause?.code === "ECONNREFUSED" ||
            (error as Error)?.message === "fetch failed";
        if (isServiceDown) {
            // Fallback: return a passing score so the assessment can continue.
            // The response is flagged so admins know it was not auto-analysed.
            return NextResponse.json({
                overall_score: 70,
                content_score: 70,
                delivery_score: 70,
                visual_presence_score: 70,
                professionalism_score: 70,
                feedback: "Your video response has been recorded. Automated AI analysis is temporarily unavailable — your response will be reviewed manually by the assessment team.",
                transcript: "",
                strengths: ["Response recorded successfully"],
                improvements: [],
                fallback: true,
            });
        }
        return NextResponse.json(
            { error: (error as Error).message || "Video analysis failed" },
            { status: 500 }
        );
    }
}
