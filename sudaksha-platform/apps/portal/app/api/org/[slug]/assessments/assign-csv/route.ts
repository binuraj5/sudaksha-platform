import { NextRequest, NextResponse } from 'next/server';
import { getApiSession } from '@/lib/get-session';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import { getIneligibleMemberIds } from '@/lib/assessment-student-restrictions';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getApiSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    // Verify slug points to valid tenant
    const tenant = await prisma.tenant.findUnique({
        where: { slug }
    });

    if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const assessmentModelId = formData.get('assessmentModelId') as string;
    const dueDate = formData.get('dueDate') as string;

    if (!file || !assessmentModelId) {
        return NextResponse.json({ error: 'Missing file or model ID' }, { status: 400 });
    }

    // Parse CSV
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true });

    // Expected columns: enrollmentNumber or email
    const rows = parsed.data as any[];

    const results = {
        total: rows.length,
        assigned: 0,
        failed: 0,
        errors: [] as string[]
    };

    // Pre-fetch assessment model to validate student tiering
    const model = await prisma.assessmentModel.findUnique({
        where: { id: assessmentModelId }
    });

    if (!model) {
        return NextResponse.json({ error: "Assessment Model not found" }, { status: 404 });
    }

    const assignerId = session.user.id as string;

    for (const row of rows) {
        const enrollmentNumber = row.enrollmentNumber || row.enrollment_number || row.enrollment;
        const email = row.email;

        if (!enrollmentNumber && !email) {
            results.failed++;
            // results.errors.push(`Row missing enrollment number and email`); // Only log true errors to reduce noise on empty lines
            continue;
        }

        // Find member
        const member = await prisma.member.findFirst({
            where: {
                tenantId: tenant.id,
                OR: Array.from(new Set([
                    enrollmentNumber ? { enrollmentNumber } : null,
                    email ? { email } : null
                ].filter(Boolean) as any))
            }
        });

        if (!member) {
            results.failed++;
            results.errors.push(`Member not found: ${enrollmentNumber || email}`);
            continue;
        }

        // Check tier eligibility from early Phase B restrictions
        const ineligible = getIneligibleMemberIds([member as any], model.targetLevel);
        if (ineligible.length > 0) {
            results.failed++;
            results.errors.push(`Level restricted: ${enrollmentNumber || email} cannot take ${model.targetLevel} models`);
            continue;
        }

        // Check if already assigned
        const existing = await prisma.memberAssessment.findFirst({
            where: {
                memberId: member.id,
                assessmentModelId
            }
        });

        if (existing) {
            results.failed++;
            results.errors.push(`Already assigned: ${enrollmentNumber || email}`);
            continue;
        }

        // Create assignment
        try {
            await prisma.memberAssessment.create({
                data: {
                    memberId: member.id,
                    assessmentModelId,
                    assignmentType: 'ASSIGNED',
                    assignedBy: assignerId,
                    status: 'DRAFT' as any
                }
            });

            results.assigned++;
        } catch (error: any) {
            results.failed++;
            results.errors.push(`Failed to assign to ${enrollmentNumber || email}: ${error.message}`);
        }
    }

    return NextResponse.json(results);
}
