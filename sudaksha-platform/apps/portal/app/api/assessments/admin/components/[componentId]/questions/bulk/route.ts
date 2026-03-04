import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ componentId: string }> }
) {
    try {
        const session = await getApiSession();
        const { componentId } = await params;

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const confirm = formData.get("confirm") === "true";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const records = parse(buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        const valid: any[] = [];
        const invalid: { row: number, errors: string[] }[] = [];

        // Fetch current component to get valid indicators
        const component = await prisma.assessmentModelComponent.findUnique({
            where: { id: componentId },
            select: { indicatorIds: true, model: { select: { status: true } } }
        });

        if (!component) {
            return NextResponse.json({ error: "Component not found" }, { status: 404 });
        }

        if (component.model.status === "PUBLISHED") {
            return NextResponse.json({ error: "Cannot modify a published assessment model" }, { status: 403 });
        }

        const validIndicatorIds = new Set(component.indicatorIds);

        for (let i = 0; i < records.length; i++) {
            const row = records[i] as Record<string, string | undefined>;
            const errors: string[] = [];

            // Basic Validation
            if (!row.question_text || row.question_text.length < 10) {
                errors.push("Question text must be at least 10 characters.");
            }

            const validTypes = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ESSAY', 'FILL_IN_BLANK', 'CODING_CHALLENGE'];
            if (!row.question_type || !validTypes.includes(row.question_type)) {
                errors.push(`Invalid question type. Must be one of: ${validTypes.join(", ")}`);
            }

            // Type specific validation
            let options = null;
            let correctAnswer = row.correct_answer;

            if (row.question_type === 'MULTIPLE_CHOICE') {
                const rowOptions = [];
                for (let j = 1; j <= 6; j++) {
                    const optText = row[`option_${j}`];
                    if (optText) {
                        rowOptions.push({
                            text: optText,
                            isCorrect: String(row.correct_answer) === String(j),
                            order: j - 1
                        });
                    }
                }

                if (rowOptions.length < 2) {
                    errors.push("MCQ must have at least 2 options.");
                }
                if (!rowOptions.some(o => o.isCorrect)) {
                    errors.push("MCQ must have a valid correct answer (1-6).");
                }
                options = rowOptions;
                correctAnswer = undefined; // Stored in options for MCQ
            } else if (row.question_type === 'TRUE_FALSE') {
                if (row.correct_answer !== 'true' && row.correct_answer !== 'false') {
                    errors.push("TRUE_FALSE correct answer must be 'true' or 'false'.");
                }
            }

            // Indicator validation
            let indicators: string[] = [];
            if (row.indicator_ids) {
                indicators = row.indicator_ids.split(",").map((s: string) => s.trim());
                for (const id of indicators) {
                    if (!validIndicatorIds.has(id)) {
                        errors.push(`Indicator ID ${id} is not valid for this component.`);
                    }
                }
            }

            if (errors.length > 0) {
                invalid.push({ row: i + 2, errors }); // +2 for 1-based and header row
            } else {
                valid.push({
                    componentId,
                    questionText: (row.question_text ?? "").trim(),
                    questionType: (row.question_type ?? "MULTIPLE_CHOICE").trim() as "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "FILL_IN_BLANK" | "CODING_CHALLENGE",
                    options: options ?? [],
                    correctAnswer: correctAnswer != null ? String(correctAnswer) : undefined,
                    points: parseInt(row.points ?? "1") || 1,
                    timeLimit: row.time_limit_seconds ? parseInt(row.time_limit_seconds) : null,
                    linkedIndicators: indicators,
                    explanation: row.explanation ?? null,
                    order: i
                });
            }
        }

        if (confirm && valid.length > 0 && invalid.length === 0) {
            // Bulk insert
            await prisma.componentQuestion.createMany({
                data: valid
            });
            return NextResponse.json({ success: true, count: valid.length });
        }

        return NextResponse.json({ valid, invalid });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
