import { getApiSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PREDEFINED_TEMPLATES = [
    {
        name: "Department Performance Report",
        description: "Analyze performance metrics across different departments.",
        type: "PDF",
        isSystem: true,
        config: {
            source: "assessments",
            metrics: ["completion_rate", "avg_score", "top_performers"],
            charts: ["bar_chart", "pie_chart"]
        }
    },
    {
        name: "Individual Development Plan (IDP)",
        description: "Detailed report on individual employee growth and gaps.",
        type: "PDF",
        isSystem: true,
        config: {
            source: "member",
            metrics: ["competency_gaps", "learning_path_progress"],
            charts: ["radar_chart"]
        }
    },
    {
        name: "Role Readiness Report",
        description: "Assess employee readiness for next-level roles.",
        type: "EXCEL",
        isSystem: true,
        config: {
            source: "member_role",
            metrics: ["readiness_score", "critical_competencies"],
            charts: ["table"]
        }
    },
    {
        name: "Assessment Campaign Summary",
        description: "Overview of a specific assessment campaign execution.",
        type: "PDF",
        isSystem: true,
        config: {
            source: "campaign",
            metrics: ["participation", "pass_rate", "avg_duration"],
            charts: ["line_chart", "bar_chart"]
        }
    },
    {
        name: "Competency Heatmap",
        description: "Visual heatmap of organizational competencies.",
        type: "PDF",
        isSystem: true,
        config: {
            source: "organization",
            metrics: ["competency_distribution"],
            charts: ["heatmap"]
        }
    },
    {
        name: "Training ROI Report",
        description: "Estimated ROI based on training outcomes and performance.",
        type: "PDF",
        isSystem: true,
        config: {
            source: "training",
            metrics: ["cost_per_head", "performance_delta"],
            charts: ["bar_chart"]
        }
    }
];

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        // Check if system templates exist, if not seed them
        const systemCount = await prisma.reportTemplate.count({ where: { isSystem: true } });

        if (systemCount === 0) {
            await prisma.reportTemplate.createMany({
                data: PREDEFINED_TEMPLATES
            });
        }

        // Fetch System Templates + Tenant Custom Templates
        const templates = await prisma.reportTemplate.findMany({
            where: {
                OR: [
                    { isSystem: true },
                    { tenantId: clientId }
                ]
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(templates);

    } catch (error) {
        console.error("Templates Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
