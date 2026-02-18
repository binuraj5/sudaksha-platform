import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Layers,
    LayoutList,
    PlayCircle,
    ShieldAlert,
    Target
} from "lucide-react";
import Link from "next/link";
import { StartAssessmentButton } from "@/components/individuals/StartAssessmentButton";

export default async function MyAssessmentsPage() {
    const session = await getApiSession() as any;
    if (!session || !session.user?.email) redirect("/assessments/login");

    const member = await prisma.member.findUnique({
        where: { email: session.user.email },
        select: { id: true, type: true }
    });

    if (!member) redirect("/assessments/individuals/onboarding");

    const assessments = await prisma.memberAssessment.findMany({
        where: {
            memberId: member.id,
            status: { in: ["DRAFT", "IN_PROGRESS", "ASSIGNED"] }
        },
        include: {
            assessmentModel: {
                select: {
                    name: true,
                    description: true,
                    durationMinutes: true,
                    targetLevel: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const mandatory = assessments.filter(a => (a.assignmentType as string) === "ASSIGNED");
    const selfSelected = assessments.filter(a => (a.assignmentType as string) === "SELF_SELECTED");

    const AssessmentCard = ({ assessment, type }: { assessment: any, type: "MANDATORY" | "SELF_SELECTED" }) => (
        <Card className={`relative group overflow-hidden border-none shadow-lg transition-all hover:shadow-xl ${type === "MANDATORY" ? "bg-gradient-to-br from-white to-red-50/30" : "bg-white"}`}>
            {type === "MANDATORY" && (
                <div className="absolute top-0 right-0 p-3">
                    <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 font-black animate-pulse">REQUIRED</Badge>
                </div>
            )}
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase border-slate-200 text-slate-400">
                        {assessment.assessmentModel.targetLevel || "General"}
                    </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {assessment.assessmentModel.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm italic">
                    {assessment.assessmentModel.description || "No description available."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="h-4 w-4 text-indigo-400" />
                        <span>{assessment.assessmentModel.durationMinutes || 30} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-indigo-400" />
                        <span className="capitalize">{assessment.status.toLowerCase().replace('_', ' ')}</span>
                    </div>
                </div>
                {assessment.status === "IN_PROGRESS" && (
                    <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${assessment.completionPercentage || 0}%` }}
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-2">
                <StartAssessmentButton
                    modelId={assessment.assessmentModelId}
                    variant="default"
                    className={`w-full gap-2 rounded-xl h-11 font-bold ${type === "MANDATORY" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                    <PlayCircle className="h-4 w-4" />
                    {assessment.status === "IN_PROGRESS" ? "Continue Assessment" : "Start Now"}
                </StartAssessmentButton>
            </CardFooter>
        </Card>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 lowercase italic">My <span className="text-indigo-600 font-serif not-italic">Assessments</span></h1>
                    <p className="text-slate-500 italic font-medium mt-1">Manage your required tasks and self-selected growth path.</p>
                </div>
                <Button asChild size="lg" className="rounded-2xl font-black bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-100 shadow-sm gap-2">
                    <Link href="/assessments/individuals/browse">
                        <LayoutList className="h-5 w-5" />
                        Browse Catalog
                    </Link>
                </Button>
            </header>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-slate-500 data-[state=active]:text-indigo-600">
                        All ({assessments.length})
                    </TabsTrigger>
                    <TabsTrigger value="mandatory" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-slate-500 data-[state=active]:text-red-600">
                        Mandatory ({mandatory.length})
                    </TabsTrigger>
                    <TabsTrigger value="self" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-slate-500 data-[state=active]:text-indigo-600">
                        Self-Selected ({selfSelected.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assessments.length === 0 ? (
                            <Card className="col-span-full py-20 bg-slate-50/50 border-dashed border-2 text-center rounded-[2.5rem]">
                                <CardContent className="flex flex-col items-center">
                                    <div className="p-4 bg-white rounded-3xl shadow-sm mb-4">
                                        <Layers className="h-10 w-10 text-slate-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 italic">Queue is empty</h3>
                                    <p className="text-slate-500 max-w-xs mt-2 mb-6">You don't have any assessments in progress or assigned.</p>
                                    <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                                        <Link href="/assessments/individuals/browse">Explore Assessments</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            assessments.map(a => (
                                <AssessmentCard key={a.id} assessment={a} type={a.assignmentType as any} />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="mandatory" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mandatory.length === 0 ? (
                            <Card className="col-span-full py-20 bg-slate-50/50 border-dashed border-2 text-center rounded-[2.5rem]">
                                <CardContent className="flex flex-col items-center text-slate-400">
                                    <ShieldAlert className="h-10 w-10 mb-4 opacity-20" />
                                    <p className="font-bold italic">No mandatory assessments assigned at this time.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            mandatory.map(a => (
                                <AssessmentCard key={a.id} assessment={a} type="MANDATORY" />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="self" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {selfSelected.length === 0 ? (
                            <Card className="col-span-full py-20 bg-slate-50/50 border-dashed border-2 text-center rounded-[2.5rem]">
                                <CardContent className="flex flex-col items-center text-slate-400">
                                    <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                                    <p className="font-bold italic">No self-selected assessments in your queue.</p>
                                    <Button asChild variant="outline" className="mt-4 border-indigo-100 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                                        <Link href="/assessments/individuals/browse">Go to Catalog</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            selfSelected.map(a => (
                                <AssessmentCard key={a.id} assessment={a} type="SELF_SELECTED" />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="pt-10 border-t border-slate-100">
                <Card className="bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <h3 className="text-3xl font-black text-white italic">Ready for <span className="text-indigo-400 not-italic font-serif">something new?</span></h3>
                            <p className="text-indigo-200/60 max-w-lg font-medium italic">Discover assessments curated for your career path and stay ahead of the curve.</p>
                        </div>
                        <Button asChild size="lg" className="rounded-2xl h-14 px-10 font-black bg-indigo-500 hover:bg-indigo-400 transition-transform hover:scale-105">
                            <Link href="/assessments/individuals/browse">Explore Catalog</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
