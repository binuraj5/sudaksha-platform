import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ReportBuilder } from "@/components/Reports/ReportBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { redirect, notFound } from "next/navigation";

export default async function OrgReportsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await getApiSession() as { user: { id: string } } | null;
    const { slug } = await params;

    if (!session?.user?.id) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    const clientId = tenant.id;

    const myReports = await prisma.report.findMany({
        where: { tenantId: clientId, userId: session.user.id },
        include: { template: true },
        orderBy: { generatedAt: "desc" },
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mb-2">
                        Reports Center
                    </h1>
                    <p className="text-gray-500 font-medium">Analyze and export data</p>
                </div>
                <ReportBuilder clientId={clientId} />
            </header>

            <Tabs defaultValue="my-reports">
                <TabsList>
                    <TabsTrigger value="my-reports">My Reports ({myReports.length})</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                </TabsList>

                <TabsContent value="my-reports" className="space-y-4">
                    {myReports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                            No reports generated yet. Click &quot;Create Report&quot; to start.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myReports.map((report) => (
                                <Card key={report.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base line-clamp-1">{report.name}</CardTitle>
                                            {report.template.type === "EXCEL" ? (
                                                <FileText className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <FileText className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                        <CardDescription className="text-xs">
                                            {new Date(report.generatedAt).toLocaleString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-gray-500 mb-4">
                                            Template: {report.template.name}
                                            <br />
                                            Status: <span className="text-green-600 font-bold">{report.status}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Download className="mr-2 h-3 w-3" /> Download
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="scheduled">
                    <div className="text-center py-12 text-gray-500">
                        Scheduled reports feature coming soon.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
