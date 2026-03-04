import { getApiSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ clientId: string, employeeId: string }> }
) {
    try {
        const session = await getApiSession();
        const { clientId, employeeId } = await params;

        if (!session || (session.user.role !== "CLIENT_ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        if (!session || (user.role !== "SUPER_ADMIN" && user.clientId !== clientId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { projectId, departmentId } = body;

        // Verify employee belongs to client
        const employee = await prisma.user.findFirst({
            where: { id: employeeId, clientId }
        });

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 });
        }

        // Update employee
        const updatedEmployee = await prisma.user.update({
            where: { id: employeeId },
            data: {
                projectId,
                departmentId
            }
        });

        return NextResponse.json(updatedEmployee);
    } catch (error: any) {
        console.error("Assign employee error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
