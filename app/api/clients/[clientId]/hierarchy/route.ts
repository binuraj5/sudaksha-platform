import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch current member
        const member = await prisma.member.findUnique({
            where: { email: session.user.email },
            include: {
                orgUnit: {
                    include: {
                        parent: true,
                        manager: {
                            select: { id: true, name: true, avatar: true, designation: true, email: true }
                        }
                    }
                },
                reportingManager: {
                    select: { id: true, name: true, avatar: true, designation: true, email: true }
                },
                directReports: {
                    where: { isActive: true },
                    select: { id: true, name: true, avatar: true, designation: true, email: true }
                },
                managedUnits: {
                    where: { isActive: true },
                    select: { id: true, name: true, type: true }
                }
            }
        });

        if (!member) {
            return NextResponse.json({ error: "Member profile not found" }, { status: 404 });
        }

        // Fetch Peers (Same team/unit)
        let peers: any[] = [];
        if (member.orgUnitId) {
            peers = await prisma.member.findMany({
                where: {
                    orgUnitId: member.orgUnitId,
                    id: { not: member.id },
                    isActive: true
                },
                select: { id: true, name: true, avatar: true, designation: true, email: true },
                take: 20
            });
        }

        // Hierarchy Summary
        const hierarchy = {
            me: {
                id: member.id,
                name: member.name,
                avatar: member.avatar,
                designation: member.designation,
                email: member.email,
                role: member.role,
                type: member.type
            },
            manager: member.reportingManager || member.orgUnit?.manager || null,
            directReports: member.directReports || [],
            peers: peers,
            orgUnit: member.orgUnit ? {
                id: member.orgUnit.id,
                name: member.orgUnit.name,
                type: member.orgUnit.type,
                parent: member.orgUnit.parent ? {
                    id: member.orgUnit.parent.id,
                    name: member.orgUnit.parent.name,
                    type: member.orgUnit.parent.type
                } : null
            } : null,
            managedUnits: member.managedUnits || []
        };

        return NextResponse.json(hierarchy);

    } catch (error) {
        console.error("Hierarchy API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
