"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    Save,
    Loader2,
    Shield,
    Zap,
    Mail,
    Key,
    AlertTriangle,
    Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SystemConfig = {
    platformName: string;
    supportEmail: string;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    featureAIQuestions: boolean;
    featureBulkUpload: boolean;
    featureCustomReports: boolean;
    featureCareerPortal: boolean;
};

const defaultConfig: SystemConfig = {
    platformName: "SudAssess",
    supportEmail: "",
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    featureAIQuestions: true,
    featureBulkUpload: true,
    featureCustomReports: true,
    featureCareerPortal: true,
};

export default function AdminSettingsPage() {
    const [config, setConfig] = useState<SystemConfig>(defaultConfig);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data && typeof data === "object") setConfig((c) => ({ ...c, ...data }));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            if (!res.ok) throw new Error("Save failed");
            toast.success("System config saved.");
        } catch {
            toast.error("Failed to save. Check console or try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8 max-w-7xl pb-24 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 space-y-10 max-w-7xl pb-24">
            {/* Header */}
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 lowercase">
                        System <span className="text-indigo-600">Config</span>
                    </h1>
                    <p className="text-slate-500 font-medium italic">
                        Platform-wide defaults, feature flags, and security options.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl font-bold italic h-12 bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General */}
                <Card className="rounded-2xl border border-slate-100 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black italic tracking-tight text-slate-900">
                                    General
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-sm">
                                    Platform name and support contact
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Platform name</Label>
                            <Input
                                value={config.platformName}
                                onChange={(e) => setConfig((c) => ({ ...c, platformName: e.target.value }))}
                                className="rounded-xl border-slate-200"
                                placeholder="SudAssess"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Support email</Label>
                            <Input
                                type="email"
                                value={config.supportEmail}
                                onChange={(e) => setConfig((c) => ({ ...c, supportEmail: e.target.value }))}
                                className="rounded-xl border-slate-200"
                                placeholder="support@example.com"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="rounded-2xl border border-slate-100 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black italic tracking-tight text-slate-900">
                                    Security
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-sm">
                                    Session and login limits
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Session timeout (minutes)</Label>
                            <Input
                                type="number"
                                min={5}
                                max={1440}
                                value={config.sessionTimeoutMinutes}
                                onChange={(e) =>
                                    setConfig((c) => ({ ...c, sessionTimeoutMinutes: parseInt(e.target.value, 10) || 60 }))
                                }
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Max login attempts before lockout</Label>
                            <Input
                                type="number"
                                min={3}
                                max={20}
                                value={config.maxLoginAttempts}
                                onChange={(e) =>
                                    setConfig((c) => ({ ...c, maxLoginAttempts: parseInt(e.target.value, 10) || 5 }))
                                }
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Features */}
                <Card className="rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black italic tracking-tight text-slate-900">
                                    Feature flags
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-sm">
                                    Enable or disable platform features for all tenants (defaults)
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { key: "featureAIQuestions", label: "AI-generated questions", desc: "Allow AI question generation in assessments" },
                                { key: "featureBulkUpload", label: "Bulk upload", desc: "CSV/Excel user and question upload" },
                                { key: "featureCustomReports", label: "Custom reports", desc: "Report builder and exports" },
                                { key: "featureCareerPortal", label: "Career portal", desc: "B2C career and gap analysis" },
                            ].map(({ key, label, desc }) => (
                                <div
                                    key={key}
                                    className={cn(
                                        "flex items-start gap-3 p-4 rounded-xl border border-slate-100",
                                        "hover:bg-slate-50/50 transition-colors"
                                    )}
                                >
                                    <Checkbox
                                        id={key}
                                        checked={config[key as keyof SystemConfig] as boolean}
                                        onCheckedChange={(checked) =>
                                            setConfig((c) => ({ ...c, [key]: !!checked }))
                                        }
                                        className="mt-0.5"
                                    />
                                    <div className="space-y-0.5">
                                        <Label htmlFor={key} className="font-semibold text-slate-800 cursor-pointer">
                                            {label}
                                        </Label>
                                        <p className="text-xs text-slate-500">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Integrations (placeholder) */}
                <Card className="rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Key className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black italic tracking-tight text-slate-900">
                                    Integrations
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-sm">
                                    API keys and external services (configure via environment variables in production)
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                            <p className="text-sm text-slate-600">
                                OpenAI, Anthropic, and other keys are read from <code className="bg-slate-200 px-1 rounded text-xs">.env</code>.
                                No keys are stored in the database. To change them, update your environment and restart the server.
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "NEXTAUTH_SECRET"].map((v) => (
                                    <span key={v} className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-500">
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger zone */}
                <Card className="rounded-2xl border border-red-100 bg-red-50/30 lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black italic tracking-tight text-slate-900">
                                    Danger zone
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-sm">
                                    Irreversible or high-impact actions
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 mb-4">
                            Database migrations and cache clearing are performed via CLI or deployment scripts.
                            Contact your platform administrator for critical system changes.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="rounded-xl border-red-200 text-red-700 hover:bg-red-50" disabled>
                                Clear application cache
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl border-slate-200" disabled>
                                Run health check
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
