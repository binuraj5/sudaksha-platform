
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SkillRadar from "@/components/career/SkillRadar";
import PortalLayout from "@/components/layout/PortalLayout";

// Mock Data
const MY_SKILLS_DATA = [
    { subject: 'React', A: 8, B: 9, fullMark: 10 },
    { subject: 'Node.js', A: 6, B: 8, fullMark: 10 },
    { subject: 'SQL', A: 9, B: 7, fullMark: 10 }, // Stronger than required
    { subject: 'System Design', A: 4, B: 7, fullMark: 10 }, // Gap
    { subject: 'Cloud (AWS)', A: 5, B: 8, fullMark: 10 }, // Gap
    { subject: 'Communication', A: 9, B: 9, fullMark: 10 },
];

export default async function CareerPulsePage() {
    const session = await getServerSession(authOptions);

    if (!session || !(session as { user?: { role?: string } }).user) {
        redirect("/auth/login");
    }

    const sessionUser = (session as { user: { role?: string } }).user;
    const currentRole = sessionUser.role || 'Software Engineer';
    const targetRole = 'Senior Software Engineer';

    // Identify Gaps (where Required > Current)
    const gaps = MY_SKILLS_DATA.filter(s => s.B > s.A);

    return (
        <PortalLayout>
            <div className="container mx-auto py-6 max-w-6xl space-y-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Career Pulse</h1>
                        <p className="text-slate-500">Analyze your skills and plan your growth towards {targetRole}.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <div className="text-right hidden md:block mr-4">
                            <p className="text-xs text-slate-400 uppercase">Current Role</p>
                            <p className="font-semibold text-slate-700">{currentRole.replace("_", " ")}</p>
                        </div>
                        <ArrowRight className="text-slate-300 hidden md:block" />
                        <div className="text-right hidden md:block ml-4">
                            <p className="text-xs text-slate-400 uppercase">Target Role</p>
                            <p className="font-semibold text-green-700">{targetRole}</p>
                        </div>
                    </div>
                </div>

                {/* VISUALIZATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skill Gap Analysis</CardTitle>
                            <CardDescription>Comparing your current proficiency vs. role expectations.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <SkillRadar data={MY_SKILLS_DATA} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Skill Gaps</CardTitle>
                            <CardDescription>Focus areas to reach the next level.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {gaps.map((gap) => (
                                    <div key={gap.subject} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div>
                                            <p className="font-semibold text-red-900">{gap.subject}</p>
                                            <p className="text-xs text-red-600">Current: {gap.A}/10 → Target: {gap.B}/10</p>
                                        </div>
                                        <Link href="/individuals/catalog">
                                            <Button size="sm" variant="destructive" className="bg-red-600 hover:bg-red-700">
                                                <Target className="w-3 h-3 mr-2" />
                                                Improve
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                                {gaps.length === 0 && (
                                    <div className="text-center py-8 text-green-600">
                                        <p className="font-semibold">You are fully qualified for this role!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* DEVELOPMENT PLAN */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recommended Development Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Course</Badge>
                                <h3 className="font-semibold text-lg">Advanced AWS Architecture</h3>
                                <p className="text-sm text-slate-500 mb-4">Closes Gap: Cloud (AWS)</p>
                                <Button className="w-full" variant="outline">Start Learning</Button>
                            </div>
                            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <Badge className="mb-2 bg-purple-100 text-purple-800 hover:bg-purple-100">Assessment</Badge>
                                <h3 className="font-semibold text-lg">System Design Mock Interview</h3>
                                <p className="text-sm text-slate-500 mb-4">Closes Gap: System Design</p>
                                <Button className="w-full" variant="outline">Take Assessment</Button>
                            </div>
                            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-100">Project</Badge>
                                <h3 className="font-semibold text-lg">Scalable Microservices</h3>
                                <p className="text-sm text-slate-500 mb-4">Practical Application</p>
                                <Button className="w-full" variant="outline">View Project</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PortalLayout>
    );
}
