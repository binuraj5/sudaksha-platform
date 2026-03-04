import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SurveyResultsExport } from "@/components/assessments/admin/surveys/SurveyResultsExport";

export default async function SurveyResultsPage({ params }: { params: Promise<{ clientId: string; surveyId: string }> }) {
    const session = await getServerSession(authOptions);
    const { clientId, surveyId } = await params;

    const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: { questions: { orderBy: { order: 'asc' } } }
    });

    if (!survey) return <div>Not Found</div>;

    const responseCount = await prisma.surveyResponse.count({ where: { surveyId } });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{survey.name} - Results</h1>
                    <p className="text-gray-500">Total Responses: <span className="font-bold text-indigo-600">{responseCount}</span></p>
                </div>
                <SurveyResultsExport clientId={clientId} surveyId={surveyId} surveyName={survey.name} />
            </div>

            <div className="grid gap-6">
                {survey.questions.map((q, idx) => (
                    <Card key={q.id}>
                        <CardHeader>
                            <CardTitle className="text-base text-gray-700">Q{idx + 1}: {q.questionText}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {q.questionType === 'LIKERT' && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Strongly Agree</span>
                                        <span className="font-bold">45%</span>
                                    </div>
                                    <Progress value={45} className="h-2 bg-gray-100" />

                                    <div className="flex items-center justify-between text-sm mt-2">
                                        <span>Agree</span>
                                        <span className="font-bold">30%</span>
                                    </div>
                                    <Progress value={30} className="h-2 bg-gray-100" />
                                </div>
                            )}
                            {q.questionType === 'TEXT' && (
                                <div className="italic text-gray-400 text-sm">Text responses analysis coming soon.</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
