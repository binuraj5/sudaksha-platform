import { getApiSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StartAssessmentButton } from "@/components/individuals/StartAssessmentButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default async function IndividualsBrowsePage() {
    const session = await getApiSession();

    if (!session) {
        redirect("/assessments/login");
    }

    const u = session.user as any;
    const isEmployee = u?.role === "EMPLOYEE" || u?.userType === "TENANT" || u?.role === "TENANT_USER" || u?.accountType === "CLIENT_USER";

    if (isEmployee) {
        redirect("/assessments/individuals/assessments");
    }

    const models = await prisma.assessmentModel.findMany({
        where: {
            isActive: true,
            status: { in: ["PUBLISHED", "ACTIVE"] },
            OR: [
                { tenantId: null },
                { tenant: { type: "SYSTEM" } },
            ],
        },
        select: {
            id: true,
            name: true,
            description: true,
            durationMinutes: true,
            targetLevel: true,
            _count: { select: { memberAssessments: true } },
        },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/assessments/individuals/dashboard"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4 inline-block"
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Browse Assessments</h1>
                    <p className="text-gray-500 mt-1">
                        Choose an assessment to develop your skills. Free tier: 10 assessments per month.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {models.length === 0 ? (
                        <Card className="col-span-2 p-8 text-center">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No assessments available</h3>
                            <p className="text-gray-500">Check back later for new assessments.</p>
                        </Card>
                    ) : (
                        models.map((assessment: any) => (
                            <Card
                                key={assessment.id}
                                className="hover:shadow-lg transition-shadow border-slate-200"
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                            {assessment.targetLevel || "General"}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg mt-2 line-clamp-1">
                                        {assessment.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {assessment.description || "Skill assessment"}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="pt-2 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {assessment.durationMinutes ?? 30} min
                                    </span>
                                    <StartAssessmentButton
                                        modelId={assessment.id}
                                        variant="ghost"
                                        size="sm"
                                        className="text-indigo-600 hover:text-indigo-700"
                                    >
                                        Start Assessment
                                    </StartAssessmentButton>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
