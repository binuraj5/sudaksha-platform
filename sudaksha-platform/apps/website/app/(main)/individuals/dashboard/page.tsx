
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type SessionWithUser = { user: { id: string }; [key: string]: unknown };

export default async function B2CDashboard() {
    const session = await getServerSession(authOptions) as SessionWithUser | null;

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // 1. Fetch My Learning
    const memberAssessments = await prisma.memberAssessment.findMany({
        where: {
            memberId: session.user.id,
        },
        include: {
            assessmentModel: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 3 // Limit to recent
    });

    return (
        <div className="container mx-auto py-4 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Learning Dashboard</h1>
                    <p className="text-slate-500">Track your skills and explore new certifications.</p>
                </div>
                <Link href="/individuals/catalog">
                    <Button variant="default" className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <ShoppingBag className="h-4 w-4" />
                        Explore Catalog
                    </Button>
                </Link>
            </div>

            {/* UPSELL BANNER */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
                <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Unlock Your Potential with Premium Assessments</h2>
                        <p className="text-slate-300 max-w-xl">
                            Get certified in industry-standard skills like Full Stack Development, Data Science, and AI.
                            Our assessments are recognized by top 500+ hiring partners.
                        </p>
                        <div className="flex gap-3">
                            <Link href="/individuals/catalog">
                                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                                    View Premium Catalog
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {/* <img src="/dashboard-hero.png" alt="Hero" className="h-32 w-auto hidden md:block" /> */}
                </CardContent>
            </Card>

            {/* MY RECENT ASSESSMENTS */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">Continue Learning</h2>
                    <Link href="/assessments/dashboard" className="text-blue-600 hover:underline text-sm">
                        View All
                    </Link>
                </div>

                {memberAssessments.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500 border-dashed">
                        <p>No active assessments. Browse the catalog to start.</p>
                        <Link href="/individuals/catalog">
                            <Button variant="outline" className="mt-4">Browse Catalog</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {memberAssessments.map((assign) => (
                            <Card key={assign.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <Badge variant={assign.status === "ACTIVE" || assign.status === "DRAFT" ? "default" : "secondary"}>
                                            {assign.status.replace("_", " ")}
                                        </Badge>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {assign.assessmentModel.durationMinutes ?? 0} min
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg mt-2 truncate">{assign.assessmentModel.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/assessments/take/${assign.id}`}>
                                        <Button className="w-full mt-2" size="sm">
                                            <PlayCircle className="w-4 h-4 mr-2" />
                                            Continue
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
