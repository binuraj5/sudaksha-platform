import { getApiSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Briefcase } from "lucide-react";
import { getLabelsForTenant } from "@/lib/tenant-labels";

const basePath = (slug: string) => `/assessments/org/${slug}`;
const FACULTY_TYPE_LABELS: Record<string, string> = {
    PERMANENT: "Permanent",
    ADJUNCT: "Adjunct",
    VISITING: "Visiting",
};

export default async function OrgFacultyDetailPage({
    params,
}: {
    params: Promise<{ slug: string; facultyId: string }>;
}) {
    const session = await getApiSession();
    const { slug, facultyId } = await params;

    if (!session) redirect("/assessments/login");

    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) notFound();

    if (tenant.type === "CORPORATE") redirect(`/assessments/org/${slug}/employees`);

    const faculty = await prisma.member.findFirst({
        where: { id: facultyId, tenantId: tenant.id, type: "EMPLOYEE" },
        include: {
            orgUnit: { select: { id: true, name: true, code: true, type: true } },
        },
    });

    if (!faculty) notFound();

    const labels = getLabelsForTenant((tenant.type as "CORPORATE" | "INSTITUTION") || "INSTITUTION");

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <Button variant="ghost" asChild className="mb-4 -ml-2">
                <Link href={`${basePath(slug)}/faculty`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to {labels.facultyPlural || "Faculty"}
                </Link>
            </Button>

            <div className="flex items-start gap-6 bg-white p-6 rounded-xl border shadow-sm">
                <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">
                        {faculty.name?.[0] || "?"}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{faculty.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1 flex-wrap">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>{faculty.designation || labels.faculty || "Faculty"}</span>
                        {faculty.facultyType && (
                            <>
                                <span>•</span>
                                <Badge variant="secondary">
                                    {FACULTY_TYPE_LABELS[faculty.facultyType] || faculty.facultyType}
                                </Badge>
                            </>
                        )}
                        {faculty.orgUnit && (
                            <>
                                <span>•</span>
                                <Link
                                    href={
                                        faculty.orgUnit.type === "DEPARTMENT"
                                            ? `${basePath(slug)}/departments/${faculty.orgUnit.id}`
                                            : `${basePath(slug)}/classes/${faculty.orgUnit.id}`
                                    }
                                    className="text-primary hover:underline"
                                >
                                    {faculty.orgUnit.name}
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        <Badge variant="outline">{faculty.memberCode || "—"}</Badge>
                        <Badge variant={faculty.isActive ? "default" : "secondary"}>
                            {faculty.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                            {faculty.role?.replace(/_/g, " ")}
                        </Badge>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${faculty.email}`} className="text-primary hover:underline">
                            {faculty.email}
                        </a>
                    </div>
                    {faculty.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{faculty.phone}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
