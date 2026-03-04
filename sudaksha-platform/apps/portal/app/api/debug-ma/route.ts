import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const modelId = "cmma528fy0005x64ka66jbxfz";
    const memberId = "cmlrqwyb00005ma5ww3800m3w";
    const assignedBy = "cmlrqwyad0003ma5we8ptz1d6";

    let result: any = {};

    try {
        const insert = await prisma.memberAssessment.create({
            data: {
                memberId,
                assessmentModelId: modelId,
                assignmentType: 'ASSIGNED',
                assignedBy,
                status: 'NOT_STARTED' as any
            }
        });
        result.success = insert;
    } catch (e: any) {
        result.error = e.message;
        result.name = e.name;
        result.code = e.code;
    }

    return NextResponse.json(result);
}
