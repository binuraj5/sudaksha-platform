
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

type SessionWithUser = { user: { id: string };[key: string]: unknown };

export default async function CatalogPage() {
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // LIST ONLY PUBLISHED MODELS
    // In real app, filter where status = 'PUBLISHED' or similar
    // Also we might want to exclude ones user already owns.
    const assessments = await prisma.assessmentModel.findMany({
        take: 20
    });

    const ownedMap = new Set();
    const myAssessments = await prisma.memberAssessment.findMany({
        where: { memberId: session.user.id },
        select: { assessmentModelId: true }
    });
    myAssessments.forEach((ma: any) => ownedMap.add(ma.assessmentModelId));

    return (
        <div className="container mx-auto py-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Assessment Catalog</h1>
                <p className="text-slate-500 mt-2">Browse and purchase premium assessments to certify your skills.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assessments.map((model: any) => {
                    const isOwned = ownedMap.has(model.id);
                    const price = 499; // Mock Price

                    return (
                        <Card key={model.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="bg-slate-50">Skill Assessment</Badge>
                                    <span className="font-bold text-green-700">₹{price}</span>
                                </div>
                                <CardTitle className="text-xl">{model.name}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {model.description || "No description provided."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {model.durationMinutes ?? 0} Minutes
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {/* Mock feature */}
                                        Certificate of Completion
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isOwned ? (
                                    <Button variant="secondary" className="w-full" disabled>
                                        Already Purchased
                                    </Button>
                                ) : (
                                    <Button className="w-full">
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Buy Now
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
