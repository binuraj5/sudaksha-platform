import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ clientId: string; employeeId: string }> }) {
    const session = await getServerSession(authOptions);
    const { clientId, employeeId } = await params;

    const employee = await prisma.member.findUnique({
        where: { id: employeeId },
        include: {
            orgUnit: true,
            reportingManager: true,
            assessments: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
    });

    if (!employee) return <div>Not Found</div>;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-start gap-6 bg-white p-6 rounded-xl border shadow-sm">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={employee.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">{employee.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{employee.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{employee.designation || 'Employee'}</span>
                        <span>•</span>
                        <span>{employee.orgUnit?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Badge variant="outline">{employee.memberCode || 'No ID'}</Badge>
                        <Badge className={employee.isActive ? 'bg-green-600' : 'bg-gray-400'}>{employee.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a href={`mailto:${employee.email}`} className="text-indigo-600 hover:underline">{employee.email}</a>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{employee.phone || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Reporting To</CardTitle></CardHeader>
                        <CardContent>
                            {employee.reportingManager ? (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{employee.reportingManager.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">{employee.reportingManager.name}</div>
                                        <div className="text-xs text-gray-500">Manager</div>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-gray-400 text-sm">No manager assigned</span>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="assessments">
                        <TabsList>
                            <TabsTrigger value="assessments">Assessments</TabsTrigger>
                            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                        </TabsList>
                        <TabsContent value="assessments" className="mt-4">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {employee.assessments.map(a => (
                                            <div key={a.id} className="p-4 flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">Assessment {a.id.substring(0, 8)}</div>
                                                    <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</div>
                                                </div>
                                                <Badge variant="outline">{a.status}</Badge>
                                            </div>
                                        ))}
                                        {employee.assessments.length === 0 && <div className="p-8 text-center text-gray-500">No assessments taken yet.</div>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="activity">
                            <div className="p-4 text-center text-gray-500">No activity logs available.</div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
