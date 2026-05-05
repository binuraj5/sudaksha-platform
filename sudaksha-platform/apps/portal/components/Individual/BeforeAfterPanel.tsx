"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeltaRow {
  competencyCode: string;
  competencyName: string;
  beforeLevel: number;
  afterLevel: number;
  delta: number;
}

interface DeltaPayload {
  id: string;
  baselineDate: string | null;
  overallDelta: number;
  competenciesCount: number;
  rows: DeltaRow[];
}

function LevelDot({ level, active }: { level: number; active: boolean }) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full ${
        active ? "bg-indigo-600" : "bg-gray-200"
      }`}
      aria-label={`Level ${level}${active ? " active" : ""}`}
    />
  );
}

function LevelDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4].map((dot) => (
        <LevelDot key={dot} level={dot} active={dot <= level} />
      ))}
      <span className="ml-1 text-xs text-gray-500">L{level}</span>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const text = delta > 0 ? `+${delta}` : `${delta}`;
  const className =
    delta > 0
      ? "bg-emerald-100 text-emerald-700"
      : delta < 0
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  return <Badge className={`${className} border-0`}>{text}</Badge>;
}

export function BeforeAfterPanel({ memberId }: { memberId: string }) {
  const [data, setData] = useState<DeltaPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) {
      setLoading(false);
      return;
    }
    fetch(`/api/member/${memberId}/delta`)
      .then((r) => (r.ok ? r.json() : { delta: null }))
      .then((d) => setData(d.delta ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <div className="h-5 w-56 bg-gray-100 animate-pulse rounded" />
        <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
        <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (!data || !data.rows.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
        <p className="text-sm font-medium text-gray-800">
          Complete your second assessment to see your progress
        </p>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          We will compare your baseline and latest results to show skill movement.
        </p>
        <Button asChild size="sm">
          <Link href="/assessments/individuals/browse">
            Take another assessment <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Your progress since{" "}
        {data.baselineDate ? format(new Date(data.baselineDate), "MMM d, yyyy") : "baseline"}
      </h3>

      <div className="space-y-3">
        {data.rows.map((row) => (
          <div
            key={row.competencyCode}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center border border-gray-100 rounded-lg p-3"
          >
            <div className="text-sm font-medium text-gray-800 truncate" title={row.competencyName}>
              {row.competencyName}
            </div>
            <LevelDots level={row.beforeLevel} />
            <LevelDots level={row.afterLevel} />
            <div className="md:justify-self-end">
              <DeltaBadge delta={row.delta} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-700 mt-4">
        Average improvement:{" "}
        <span className={data.overallDelta > 0 ? "text-emerald-700 font-semibold" : "font-semibold"}>
          {data.overallDelta > 0 ? "+" : ""}
          {data.overallDelta}
        </span>{" "}
        levels across {data.competenciesCount} competencies
      </p>
    </div>
  );
}

export function BeforeAfterPanelSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="h-5 w-56 bg-gray-100 animate-pulse rounded" />
      <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
      <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
      <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
    </div>
  );
}
