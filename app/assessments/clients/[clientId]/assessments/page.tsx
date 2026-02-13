import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus, FileText, UserPlus } from "lucide-react";
import Link from "next/link";

// DB schema uses: id, name, slug, description, sourceType, isPublished, createdAt (schema may have diverged)
type AssessmentRow = { id: string; name: string; description: string | null; sourceType: string };

export default async function AssessmentsPage({ params }: { params: Promise<{ clientId: string }> }) {
    const session = await getServerSession(authOptions);
    const { clientId } = await params;

    let assessments: AssessmentRow[] = [];
    try {
        // Use raw query to match actual DB columns (schema may have code/slug, status/isPublished divergence)
        const rows = await prisma.$queryRaw<AssessmentRow[]>`
            SELECT id, name, description, "sourceType"
            FROM "AssessmentModel"
            WHERE "isActive" = true AND ("isPublished" = true OR "isPublished" IS NULL)
            ORDER BY "createdAt" DESC
            LIMIT 20
        `;
        assessments = rows;
    } catch (e) {
        console.error("[AssessmentsPage] Failed to fetch assessments:", e);
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
                    <Link href={`/assessments/clients/${clientId}/assessments/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Assessment
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                {assessments.map(model => (
                    <Card key={model.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base line-clamp-1">{model.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{model.description ?? ""}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{model.sourceType}</span>
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
