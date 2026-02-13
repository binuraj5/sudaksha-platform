import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for validating uploaded questions
const bulkQuestionSchema = z.object({
    question_text: z.string().min(1, "Question text is required"),
    question_type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODING_CHALLENGE', 'ESSAY', 'SCENARIO_BASED', 'FILL_IN_THE_BLANK']),
    points: z.coerce.number().optional().default(1),
    time_limit: z.coerce.number().optional(),
    order: z.coerce.number().optional(),
    // For validation, we accept strings or JSON for options/arrays, but will parse them
    options: z.any().optional(),
    correct_answer: z.string().optional(),
    programming_language: z.string().optional(),
    starter_code: z.string().optional(),
    test_cases: z.string().optional(), // JSON string expected
    word_limit: z.coerce.number().optional(),
    evaluation_criteria: z.string().optional(), // JSON string expected
    media_urls: z.string().optional(), // Pipe separated
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { format, data, validateOnly } = body;
        const { id: componentId } = await params;

        let questionsRaw: any[] = [];

        if (format === 'csv') {
            questionsRaw = parse(data, {
                columns: true,
                skip_empty_lines: true,
                cast: false // manual casting via zod coerce
            });
        } else {
            questionsRaw = data.questions;
        }

        // Process and validate each question
        const processedQuestions = questionsRaw.map((q, idx) => {
            // Normalizing keys if needed, but assuming CSV headers match schema
            return { ...q, rowId: idx + 1 };
        });

        const validationResults = processedQuestions.map((q) => {
            try {
                const parsed = bulkQuestionSchema.parse(q);
                return { valid: true, row: q.rowId, data: parsed };
            } catch (error: any) {
                return { valid: false, row: q.rowId, errors: error.errors };
            }
        });

        const validQuestions = validationResults.filter(v => v.valid);
        const invalidQuestions = validationResults.filter(v => !v.valid);

        if (validateOnly) {
            return NextResponse.json({
                valid: invalidQuestions.length === 0,
                validCount: validQuestions.length,
                invalidCount: invalidQuestions.length,
                errors: invalidQuestions
            });
        }

        if (invalidQuestions.length > 0) {
            // If strict mode, maybe return error? But requirement says "User clicks Upload to process all valid rows"
            // Prompt says: "User clicks Upload to process all valid rows"
        }

        // Insert valid questions
        const createdQuestions = await prisma.$transaction(
            async (tx) => {
                const results = [];
                // Get current max order
                const lastQ = await tx.componentQuestion.findFirst({
                    where: { componentId },
                    orderBy: { order: 'desc' },
                });
                let nextOrder = (lastQ?.order || 0) + 1;

                for (const vq of validQuestions) {
                    const qData = vq.data!;

                    // Parse JSON/Pipe fields
                    let formatOptions = qData.options;
                    // Handle CSV pipe format for options
                    if (typeof formatOptions === 'string' && formatOptions.includes('|')) {
                        const opts = formatOptions.split('|');
                        // If MCQ, we need to structure it based on correctAnswer
                        if (qData.question_type === 'MULTIPLE_CHOICE') {
                            formatOptions = opts.map(opt => ({
                                text: opt,
                                isCorrect: opt === qData.correct_answer
                            }));
                        } else {
                            formatOptions = opts;
                        }
                    } else if (typeof formatOptions === 'string' && formatOptions.startsWith('[')) {
                        try { formatOptions = JSON.parse(formatOptions); } catch (e) { }
                    }

                    let testCases = qData.test_cases;
                    if (typeof testCases === 'string' && testCases.startsWith('[')) {
                        try { testCases = JSON.parse(testCases); } catch (e) { }
                    }

                    let evalCriteria = qData.evaluation_criteria;
                    if (typeof evalCriteria === 'string' && evalCriteria.startsWith('[')) {
                        try { evalCriteria = JSON.parse(evalCriteria); } catch (e) { }
                    }

                    let mediaUrls = qData.media_urls ? qData.media_urls.split('|') : [];

                    const created = await tx.componentQuestion.create({
                        data: {
                            componentId: componentId,
                            questionText: qData.question_text,
                            questionType: qData.question_type as any,
                            points: qData.points ?? 1,
                            timeLimit: qData.time_limit,
                            order: qData.order || nextOrder++, // Use provided order or auto-increment
                            options: formatOptions,
                            correctAnswer: qData.correct_answer ?? null,
                            linkedIndicators: [],
                            explanation: (qData as { explanation?: string }).explanation ?? null,
                            metadata: ({
                                programmingLanguage: qData.programming_language,
                                starterCode: qData.starter_code,
                                testCases: testCases,
                                wordLimit: qData.word_limit,
                                evaluationCriteria: evalCriteria,
                                mediaUrls: mediaUrls
                            }) as object
                        }
                    });
                    results.push(created);
                }
                return results;
            }
        );

        return NextResponse.json({
            success: true,
            summary: {
                totalRows: questionsRaw.length,
                validRows: validQuestions.length,
                invalidRows: invalidQuestions.length,
                successfulUploads: createdQuestions.length,
                failedUploads: 0
            },
            errors: invalidQuestions,
            createdQuestions
        });

    } catch (error: any) {
        console.error("Bulk upload error:", error);
        return NextResponse.json(
            { error: 'Bulk upload failed', details: error.message },
            { status: 500 }
        );
    }
}
