"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Brain } from "lucide-react";
import { CreateCompetencyDialog } from "@/components/Competencies/CreateCompetencyDialog";

export default function ClientCompetenciesPage({ params }: { params: Promise<{ clientId: string }> }) {
    const { clientId } = use(params);
    const [competencies, setCompetencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCompetencies = () => {
        fetch("/api/admin/competencies")
            .then((r) => r.json())
            .then((data) => {
                const list = data?.competencies ?? (Array.isArray(data) ? data : []);
                setCompetencies(Array.isArray(list) ? list : []);
            })
            .catch(() => setCompetencies([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (clientId) {
            setLoading(true);
            fetchCompetencies();
        }
    }, [clientId]);

    if (!clientId) return null;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/assessments/clients/${clientId}/dashboard`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none mt-4 mb-2">
                        Competencies
                    </h1>
                    <p className="text-gray-500 font-medium">Global and organization-specific competencies for roles and assessments.</p>
                </div>
                <CreateCompetencyDialog clientId={clientId} onCreated={fetchCompetencies} />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {competencies.map(c => (
                        <Card key={c.id}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{c.name}</h3>
                                    <Badge variant={c.tenantId ? "secondary" : "outline"}>
                                        {c.tenantId ? "Org" : "Global"}
                                    </Badge>
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{c.description}</p>
                                <div className="flex gap-2">
                                    <Badge variant="outline">{c.category}</Badge>
                                    <Badge variant="secondary">{c.status}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {competencies.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No competencies found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
