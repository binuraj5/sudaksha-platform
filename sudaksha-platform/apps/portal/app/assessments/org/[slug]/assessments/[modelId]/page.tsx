"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Layout,
    FileText,
    Loader2,
    CheckCircle2,
    Clock,
    Archive,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const COMPONENT_ICONS: Record<string, string> = {
    MCQ: "📝",
    SHORT_ANSWER: "✍️",
    ESSAY: "📄",
    SITUATIONAL: "📋",
    VOICE: "🎙️",
    VIDEO: "🎥",
    CODE: "💻",
    ADAPTIVE_AI: "🤖",
    PANEL: "👥",
    QUESTIONNAIRE: "📋",
    ADAPTIVE_QUESTIONNAIRE: "🤖",
};

function getStatusBadge(status: string) {
    switch (status) {
        case "PUBLISHED":
            return (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Published
                </Badge>
            );
        case "DRAFT":
            return (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none">
                    <Clock className="w-3 h-3 mr-1" /> Draft
                </Badge>
            );
        case "ARCHIVED":
            return (
                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none shadow-none">
                    <Archive className="w-3 h-3 mr-1" /> Archived
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function OrgModelDetailsPage({ params }: { params: Promise<{ slug: string; modelId: string }> }) {
    const { slug, modelId } = use(params);
    const [model, setModel] = useState<{
        id: string;
        name: string;
        code: string;
        status: string;
        targetLevel?: string | null;
        role?: { name: string };
        components?: Array<{
            id: string;
            componentType: string;
            competency?: { name: string; category: string };
            _count?: { questions: number };
        }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchModel() {
            try {
                const res = await fetch(`/api/assessments/admin/models/${modelId}`);
                if (res.ok) {
                    const data = await res.json();
                    setModel(data);
                } else {
                    setModel(null);
                }
            } catch {
                setModel(null);
            } finally {
                setLoading(false);
            }
        }
        fetchModel();
    }, [modelId]);

    if (loading) {
        return (
            <div className="container mx-auto py-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-navy-600 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading model...</p>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="container mx-auto py-16 px-4 text-center">
                <p className="text-muted-foreground mb-4">Assessment model not found.</p>
                <Button asChild variant="outline">
                    <Link href={`/assessments/org/${slug}/assessments`}>Back to Models</Link>
                </Button>
            </div>
        );
    }

    const components = model.components ?? [];

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/assessments/org/${slug}/assessments`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 h-8">
                            <ArrowLeft className="w-4 h-4" />
                            Models
                        </Button>
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{model.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{model.name}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5 font-mono">{model.code}</p>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(model.status)}
                            {model.role && (
                                <span className="text-sm text-muted-foreground">
                                    {model.role.name}
                                    {model.targetLevel && ` • ${model.targetLevel}`}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={`/assessments/org/${slug}/assessments/${modelId}/builder`}>
                            <Button className="gap-2 bg-navy-700 hover:bg-navy-600">
                                <Layout className="w-4 h-4" />
                                Open Builder
                            </Button>
                        </Link>
                        <Link href={`/assessments/org/${slug}/assessments/${modelId}/questions`}>
                            <Button variant="outline" className="gap-2">
                                <FileText className="w-4 h-4" />
                                Questions
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Card className="shadow-sm border">
                <CardHeader className="border-b bg-muted/30 py-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Components ({components.length})
                    </h2>
                </CardHeader>
                <CardContent className="p-0">
                    {components.length === 0 ? (
                        <div className="py-12 px-6 text-center">
                            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                <Layout className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">No components yet. Add them in the Builder.</p>
                            <Link href={`/assessments/org/${slug}/assessments/${modelId}/builder`}>
                                <Button>Open Builder</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {components.map((comp) => (
                                <Link
                                    key={comp.id}
                                    href={`/assessments/org/${slug}/assessments/${modelId}/questions`}
                                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">
                                            {COMPONENT_ICONS[comp.componentType] ?? "📋"}
                                        </span>
                                        <div>
                                            <p className="font-medium">
                                                {comp.competency?.name ?? "Unknown competency"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="text-xs font-medium">
                                                    {comp.componentType}
                                                </Badge>
                                                {comp._count && comp._count.questions > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {comp._count.questions} questions
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
