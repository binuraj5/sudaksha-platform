import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, LayoutGrid, Briefcase, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface AssignedAssessment {
    id: string;
    status: string;
    completionPercentage?: number;
    assessmentModel: {
        id: string;
        name: string;
        durationMinutes: number;
        role?: {
            id: string;
            name: string;
        } | null;
        metadata?: any;
    };
}

interface PersonalAssessmentsListProps {
    assessments: AssignedAssessment[];
    slug: string;
    userName: string;
    tenantName: string;
}

export function PersonalAssessmentsList({ assessments, slug, userName, tenantName }: PersonalAssessmentsListProps) {
    // Grouping logic
    const roleGroups = assessments.reduce((acc: any, curr) => {
        const roleName = curr.assessmentModel.role?.name || "General";
        if (!acc[roleName]) acc[roleName] = [];
        acc[roleName].push(curr);
        return acc;
    }, {});

    const competencyGroups = assessments.reduce((acc: any, curr) => {
        const competency = curr.assessmentModel.metadata?.primaryCompetency || "Core Skills";
        if (!acc[competency]) acc[competency] = [];
        acc[competency].push(curr);
        return acc;
    }, {});

    const renderGrid = (items: AssignedAssessment[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((assign) => (
                <Card key={assign.id} className="rounded-3xl border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group overflow-hidden bg-white">
                    <CardHeader className="pb-3 px-6 pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <Badge className={`${assign.status === "IN_PROGRESS" ? "bg-indigo-100 text-indigo-600" :
                                assign.status === "COMPLETED" ? "bg-emerald-100 text-emerald-600" :
                                    "bg-gray-100 text-gray-500"
                                } border-none rounded-lg px-2 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                                {assign.status.replace("_", " ")}
                            </Badge>
                            <span className="text-[10px] font-black text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                <Clock className="w-3 h-3" /> {assign.assessmentModel.durationMinutes} Min
                            </span>
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] tracking-tight">{assign.assessmentModel.name}</CardTitle>
                        {assign.assessmentModel.role && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <Briefcase className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{assign.assessmentModel.role.name}</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-2">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Progress</span>
                                    <span>{assign.completionPercentage || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full transition-all duration-1000"
                                        style={{ width: `${assign.completionPercentage || 0}%` }}
                                    />
                                </div>
                            </div>

                            <Link href={`/assessments/org/${slug}/assessments/take/${assign.id}`}>
                                <Button className="w-full h-12 bg-gray-900 hover:bg-black text-white font-black italic rounded-xl transition-all group-hover:scale-[1.02]">
                                    {assign.status === "NOT_STARTED" ? "Start Now" : assign.status === "COMPLETED" ? "View Insights" : "Resume"}
                                    <PlayCircle className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Assessments</h1>
                <p className="text-gray-500 font-medium">Welcome, {userName}. Here's your assessment center at <span className="text-indigo-600 font-bold">{tenantName}</span>.</p>
            </div>

            {assessments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium text-lg">No assessments are currently assigned to you.</p>
                </div>
            ) : (
                <Tabs defaultValue="all" className="space-y-8">
                    <TabsList className="bg-slate-100/50 p-1 rounded-2xl border">
                        <TabsTrigger value="all" className="rounded-xl flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4" /> All
                        </TabsTrigger>
                        <TabsTrigger value="role" className="rounded-xl flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Role-Wise
                        </TabsTrigger>
                        <TabsTrigger value="competency" className="rounded-xl flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Competency-Wise
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                        {renderGrid(assessments)}
                    </TabsContent>

                    <TabsContent value="role" className="space-y-12 mt-0">
                        {Object.entries(roleGroups).map(([roleName, items]: [string, any]) => (
                            <div key={roleName} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Briefcase className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h2 className="text-xl font-black italic text-slate-800">{roleName}</h2>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                {renderGrid(items)}
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="competency" className="space-y-12 mt-0">
                        {Object.entries(competencyGroups).map(([compName, items]: [string, any]) => (
                            <div key={compName} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-black italic text-slate-800">{compName}</h2>
                                    <div className="h-px flex-1 bg-slate-100" />
                                </div>
                                {renderGrid(items)}
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
