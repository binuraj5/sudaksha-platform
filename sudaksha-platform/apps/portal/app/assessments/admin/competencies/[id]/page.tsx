import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    Plus,
    Trash2,
    Target,
    Zap,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { AIGenerateIndicatorsDialog } from "@/components/admin/AIGenerateIndicatorsDialog";
import { BulkUploadIndicatorsDialog } from "@/components/admin/BulkUploadIndicatorsDialog";
import { AddIndicatorDialog } from "@/components/admin/AddIndicatorDialog";
import { CompetencyIndicatorsList } from "@/components/admin/CompetencyIndicatorsList";

export default async function CompetencyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getApiSession();
    const { id } = await params;

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        redirect("/assessments/login");
    }

    const competency = await prisma.competency.findUnique({
        where: { id },
        include: {
            indicators: {
                orderBy: { level: 'asc' }
            },
            roleLinks: {
                include: { role: true }
            }
        }
    });

    if (!competency) {
        notFound();
    }

    return (
        <div className="space-y-8 mt-12 pb-12">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href="/assessments/admin/competencies">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Library
                    </Link>
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader className="pb-4">
                            <Badge variant="outline" className="w-fit mb-2">{competency.category}</Badge>
                            <CardTitle className="text-2xl">{competency.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {competency.description}
                            </p>

                            <div className="pt-4 border-t space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active in Roles</h4>
                                {competency.roleLinks.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {competency.roleLinks.map(rc => (
                                            <Badge key={rc.id} variant="secondary" className="bg-blue-50 text-blue-700 border-none">
                                                {rc.role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No roles mapped yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Indicators */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Target className="h-5 w-5 text-red-600" />
                                Behavioral Indicators
                            </h2>
                            <p className="text-sm text-gray-500">Measurable evidences of this competency at each level.</p>
                        </div>
                        <div className="flex gap-2">
                            <BulkUploadIndicatorsDialog competencyId={id} />
                            <AIGenerateIndicatorsDialog
                                competencyId={id}
                                competencyName={competency.name}
                                competencyCategory={competency.category}
                            />
                            <AddIndicatorDialog competencyId={id} />
                        </div>
                    </div>

                    <CompetencyIndicatorsList
                        initialIndicators={competency.indicators}
                        competencyId={id}
                    />
                </div>
            </div>
        </div>
    );
}

