import { NextRequest, NextResponse } from "next/server";
import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET ?format=csv|excel
 * Export survey results as CSV (Excel-compatible). PDF can be added later.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string; surveyId: string }> }
) {
    try {
        const session = await getApiSession();
        const user = session?.user as any;
        if (!session || !user || (user.role !== "SUPER_ADMIN" && user.clientId !== (await params).clientId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { surveyId } = await params;
        const { searchParams } = new URL(req.url);
        const format = searchParams.get("format") || "csv";

        const survey = await prisma.survey.findFirst({
            where: { id: surveyId },
            include: {
                questions: { orderBy: { order: "asc" } },
                responses: {
                    include: {
                        member: { select: { id: true, firstName: true, lastName: true, email: true } },
                        answers: { include: { question: true } }
                    },
                    orderBy: { completedAt: "asc" }
                }
            }
        });

        if (!survey) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        if (format === "csv" || format === "excel") {
            const header = [
                "Response ID",
                "Member",
                "Email",
                "Completed At",
                "Score",
                ...survey.questions.map((q) => `"${(q.questionText || "").replace(/"/g, '""')}"`)
            ];
            const rows = survey.responses.map((r) => {
                const answerMap = new Map<string, string>();
                r.answers.forEach((a) => {
                    const val = a.answerData;
                    const str =
                        val === null || val === undefined
                            ? ""
                            : typeof val === "object"
                                ? (val as any).value ?? (val as any).text ?? JSON.stringify(val)
                                : String(val);
                    answerMap.set(a.questionId, String(str).replace(/"/g, '""'));
                });
                const memberLabel = r.member
                    ? [r.member.firstName, r.member.lastName].filter(Boolean).join(" ") || (r.member as any).email || "—"
                    : "Anonymous";
                const completedAt = r.completedAt ? new Date(r.completedAt).toISOString() : "";
                const questionCols = survey.questions.map((q) => `"${answerMap.get(q.id) ?? ""}"`);
                return [
                    r.id,
                    `"${memberLabel}"`,
                    (r.member as any)?.email ?? "—",
                    completedAt,
                    r.score ?? "",
                    ...questionCols
                ];
            });
            const csvContent = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
            const bom = "\uFEFF";
            return new NextResponse(bom + csvContent, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${(survey.name || "survey").replace(/[^a-z0-9_-]/gi, "_")}_results.csv"`
                }
            });
        }

        return NextResponse.json({ error: "Unsupported format. Use format=csv or format=excel" }, { status: 400 });
    } catch (error) {
        console.error("Survey export error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
