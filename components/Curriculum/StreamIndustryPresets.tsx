"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STREAM_PRESETS, INDUSTRY_PRESETS } from "@/lib/stream-industry-presets";
import { GraduationCap, Briefcase, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export function StreamIndustryPresets({
  clientId,
  onStreamCreated,
}: {
  clientId: string;
  onStreamCreated?: () => void;
}) {
  const [adding, setAdding] = useState<string | null>(null);

  const createFromStream = async (stream: (typeof STREAM_PRESETS)[0]) => {
    setAdding(stream.id);
    try {
      const res = await fetch(`/api/clients/${clientId}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PROGRAM",
          name: stream.name,
          code: stream.code,
          description: stream.description ?? undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create program");
      }
      toast.success(`Program "${stream.name}" added to curriculum`);
      onStreamCreated?.();
    } catch (e: any) {
      toast.error(e.message || "Failed to add stream");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border border-indigo-100 bg-indigo-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Stream presets</CardTitle>
          </div>
          <CardDescription>
            Add a program from a preset (e.g. Engineering, Commerce) for employability alignment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {STREAM_PRESETS.map((stream) => (
            <div
              key={stream.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-indigo-100 bg-white p-2"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm text-gray-900">{stream.name}</span>
                <span className="ml-2 text-xs text-gray-500 font-mono">{stream.code}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {stream.industries.slice(0, 3).map((ind) => (
                    <Badge key={ind} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                disabled={adding !== null}
                onClick={() => createFromStream(stream)}
              >
                {adding === stream.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border border-slate-200 bg-slate-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-base">Industry tags</CardTitle>
          </div>
          <CardDescription>
            Use these when linking courses or assessments to employability outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_PRESETS.map((ind) => (
              <Badge key={ind.id} variant="outline" className="font-normal">
                {ind.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
