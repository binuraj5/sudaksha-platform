import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, FileText, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

type AssessmentRow = { id: string; name: string; description: string | null; sourceType: string; status: string };


export default async function OrgAssessmentsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession();
    const { slug } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const clientId = tenant.id;
    const basePath = `/assessments/org/${slug}`;

    let assessments: AssessmentRow[] = [];
    try {
        const rows = await prisma.assessmentModel.findMany({
            where: {
                tenantId: clientId,
                status: { in: ["DRAFT", "PUBLISHED", "ACTIVE"] as any[] },
            },
            select: { id: true, name: true, description: true, sourceType: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        assessments = rows.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            sourceType: r.sourceType ?? "",
            status: r.status ?? "DRAFT",
        }));
    } catch (e) {
        console.error("[OrgAssessmentsPage] Failed to fetch assessments:", e);
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        Assessments
                    </h1>
                    <p className="text-gray-500 font-medium">Manage and assign assessments</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`${basePath}/assessments/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Assessment
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                {assessments.map((model) => (
                    <Card key={model.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base line-clamp-1">{model.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{model.description ?? ""}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 flex-wrap">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {model.sourceType}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${model.status === "PUBLISHED" || model.status === "ACTIVE"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {model.status}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                <UserPlus className="mr-2 h-4 w-4" /> Assign
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {assessments.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded border border-dashed">
                    No assessments found.
                </div>
            )}
        </div>
    );
}
