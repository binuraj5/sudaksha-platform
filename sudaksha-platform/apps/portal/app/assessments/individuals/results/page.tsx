import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function IndividualResultsPage() {
    const session = await getApiSession();

    if (!session) {
        redirect("/assessments/login");
    }

    const member = await prisma.member.findFirst({
        where: { email: session.user.email ?? "" },
        select: { id: true },
    });

    if (!member) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <p className="text-gray-600">Profile not found. Please complete onboarding.</p>
                <Button asChild className="mt-4">
                    <Link href="/assessments/individuals/onboarding">Go to Onboarding</Link>
                </Button>
            </div>
        );
    }

    const completedAssessments = await prisma.memberAssessment.findMany({
        where: {
            memberId: member.id,
            status: "COMPLETED",
        },
        include: {
            assessmentModel: {
                select: { name: true },
            },
        },
        orderBy: { completedAt: "desc" },
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                    <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
                    <p className="text-gray-500">View your scores and detailed performance reports</p>
                </div>
            </div>

            {completedAssessments.length === 0 ? (
                <Card className="py-20 text-center border-dashed">
                    <CardContent>
                        <FileText className="h-12 w-12 text-gray-200 mx-auto" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No results yet</h3>
                        <p className="text-gray-500">Complete your first assessment to see your scores here.</p>
                        <Button asChild className="mt-6 bg-indigo-600 hover:bg-indigo-700" variant="secondary">
                            <Link href="/assessments/individuals/dashboard">Go to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Assessment</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Completed On</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedAssessments.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900">{a.assessmentModel.name}</div>
                                        <div className="text-[10px] text-gray-500 uppercase">Assessment</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-gray-900">
                                                {a.overallScore != null ? Math.round(a.overallScore) : "—"}%
                                            </span>
                                            {a.passed != null &&
                                                (a.passed ? (
                                                    <Badge className="bg-green-50 text-green-700 border-none">PASSED</Badge>
                                                ) : (
                                                    <Badge className="bg-red-50 text-red-700 border-none">FAILED</Badge>
                                                ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500 font-mono">
                                        {a.completedAt ? formatDate(a.completedAt) : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/assessments/results/${a.id}`}>
                                                View Report
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
        </div>
    );
}
