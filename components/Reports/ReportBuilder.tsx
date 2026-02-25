"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowRight, ArrowLeft, Loader2, FileText, BarChart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RecommendationCard } from "@/components/assessments/RecommendationCard";

export function ReportBuilder({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");

    // Scenario for recommendations
    const [scenario, setScenario] = useState("");
    const [recommendations, setRecommendations] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        dateRange: "LAST_30_DAYS",
        departmentId: "ALL",
        roleId: "ALL"
    });

    const router = useRouter();

    useEffect(() => {
        if (!scenario || scenario.trim() === '') {
            setRecommendations([]);
            return;
        }
        const timeoutId = setTimeout(() => {
            fetch(`/api/recommendations/report?scenario=${encodeURIComponent(scenario)}`)
                .then(r => r.json())
                .then(data => setRecommendations(data.recommendations || []))
                .catch(() => setRecommendations([]));
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [scenario]);

    useEffect(() => {
        if (open) {
            fetch(`/api/clients/${clientId}/reports/templates`).then(r => r.json()).then(setTemplates);
            setStep(1);
        }
    }, [open, clientId]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/reports/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: selectedTemplate,
                    name: formData.name,
                    filters: {
                        dateRange: formData.dateRange,
                        departmentId: formData.departmentId
                    }
                })
            });

            if (res.ok) {
                toast.success("Report generated successfully");
                setOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to generate report");
            }
        } catch (error) {
            toast.error("Error");
        } finally {
            setLoading(false);
        }
    };

    const getSelectedTemplateName = () => templates.find(t => t.id === selectedTemplate)?.name;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Report
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] h-[75vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Generate Report (Step {step}/3)</DialogTitle>
                    <DialogDescription>
                        {step === 1 ? "Choose a template" : step === 2 ? "Configure filters" : "Review and Generate"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 px-1">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">Reporting Goal (Optional)</Label>
                                <Input
                                    placeholder="e.g., Identify struggling students, compare candidates..."
                                    value={scenario}
                                    onChange={e => setScenario(e.target.value)}
                                />
                            </div>

                            {recommendations.length > 0 && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <Label className="text-xs text-muted-foreground">Smart Suggestions</Label>
                                    {recommendations.map(rec => (
                                        <RecommendationCard
                                            key={rec.id}
                                            recommendation={rec}
                                            onApply={(values) => {
                                                if (values) {
                                                    // Map values appropriately
                                                    if (values.name) setFormData(prev => ({ ...prev, name: values.name as string }));
                                                    // We mock the auto apply template if there is one that matches the name conceptually
                                                    // (For now, we just proceed to step 2 with the name)
                                                    toast.success("Applied intelligent recommendation");
                                                }
                                            }}
                                            onDismiss={(id) => setRecommendations(prev => prev.filter(r => r.id !== id))}
                                        />
                                    ))}
                                </div>
                            )}

                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Available Templates</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {templates.map(t => (
                                        <div key={t.id} role="button" tabIndex={0} onClick={() => setSelectedTemplate(t.id)} onKeyDown={e => e.key === 'Enter' && setSelectedTemplate(t.id)}>
                                            <Card
                                                className={`cursor-pointer transition-all hover:border-indigo-400 ${selectedTemplate === t.id ? 'border-2 border-indigo-600 bg-indigo-50' : ''}`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {t.type === 'EXCEL' ? <FileText className="h-5 w-5 text-green-600" /> : <BarChart className="h-5 w-5 text-blue-600" />}
                                                        <h3 className="font-bold text-sm">{t.name}</h3>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 max-w-md mx-auto">
                            <div className="grid gap-2">
                                <Label>Report Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder={getSelectedTemplateName()} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Date Range</Label>
                                <Select value={formData.dateRange} onValueChange={v => setFormData({ ...formData, dateRange: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
                                        <SelectItem value="LAST_30_DAYS">Last 30 Days</SelectItem>
                                        <SelectItem value="LAST_QUARTER">Last Quarter</SelectItem>
                                        <SelectItem value="YEAR_TO_DATE">Year to Date</SelectItem>
                                        <SelectItem value="ALL_TIME">All Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Department Select Mock */}
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select value={formData.departmentId} onValueChange={v => setFormData({ ...formData, departmentId: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Departments</SelectItem>
                                        <SelectItem value="ENGINEERING">Engineering</SelectItem>
                                        <SelectItem value="SALES">Sales</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center py-8">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold">Ready to Generate</h3>
                            <p className="text-gray-500">
                                You are about to generate <strong>{formData.name || getSelectedTemplateName()}</strong> based on
                                selected filters.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between items-center mt-4 border-t pt-4">
                    {step > 1 ? (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)} disabled={!selectedTemplate}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Generate Report
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
