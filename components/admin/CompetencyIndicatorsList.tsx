"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Indicator {
    id: string;
    level: string;
    type: string;
    text: string;
}

interface CompetencyIndicatorsListProps {
    initialIndicators: Indicator[];
    competencyId: string;
}

export function CompetencyIndicatorsList({ initialIndicators, competencyId }: CompetencyIndicatorsListProps) {
    const [indicators, setIndicators] = useState(initialIndicators);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();
    const levels = ['JUNIOR', 'MIDDLE', 'SENIOR', 'EXPERT'];

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this indicator?")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/competencies/indicators/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            setIndicators(prev => prev.filter(i => i.id !== id));
            toast.success("Indicator deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete indicator");
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Tabs defaultValue="JUNIOR" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 p-1">
                {levels.map(level => (
                    <TabsTrigger
                        key={level}
                        value={level}
                        className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                    >
                        {level}
                    </TabsTrigger>
                ))}
            </TabsList>

            {levels.map(level => {
                const levelIndicators = indicators.filter(i => i.level === level);
                const positiveIndicators = levelIndicators.filter(i => i.type === 'POSITIVE');
                const negativeIndicators = levelIndicators.filter(i => i.type === 'NEGATIVE');

                return (
                    <TabsContent key={level} value={level} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Positive Indicators Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-green-50">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Positive Indicators</h4>
                                    <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-100">
                                        {positiveIndicators.length}
                                    </Badge>
                                </div>

                                {positiveIndicators.length === 0 ? (
                                    <div className="p-8 border border-dashed rounded-xl bg-gray-50/30 text-center">
                                        <p className="text-xs text-gray-400 italic">No positive indicators defined.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {positiveIndicators.map(indicator => (
                                            <IndicatorCard
                                                key={indicator.id}
                                                indicator={indicator}
                                                onDelete={() => handleDelete(indicator.id)}
                                                isDeleting={deletingId === indicator.id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Negative Indicators Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-red-50">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">Negative Indicators</h4>
                                    <Badge variant="outline" className="ml-auto bg-red-50 text-red-700 border-red-100">
                                        {negativeIndicators.length}
                                    </Badge>
                                </div>

                                {negativeIndicators.length === 0 ? (
                                    <div className="p-8 border border-dashed rounded-xl bg-gray-50/30 text-center">
                                        <p className="text-xs text-gray-400 italic">No negative indicators defined.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {negativeIndicators.map(indicator => (
                                            <IndicatorCard
                                                key={indicator.id}
                                                indicator={indicator}
                                                onDelete={() => handleDelete(indicator.id)}
                                                isDeleting={deletingId === indicator.id}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                );
            })}
        </Tabs>
    );
}

function IndicatorCard({ indicator, onDelete, isDeleting }: { indicator: any, onDelete: () => void, isDeleting: boolean }) {
    return (
        <Card className="shadow-none border-gray-100 hover:border-blue-100 transition-colors group relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${indicator.type === 'POSITIVE' ? 'bg-green-500' : 'bg-red-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="p-4 flex justify-between items-start gap-4">
                <div className="flex gap-3">
                    {indicator.type === 'POSITIVE' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{indicator.text || indicator.description}</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </CardContent>
        </Card>
    );
}
