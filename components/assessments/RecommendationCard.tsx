"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RecommendationItem {
  id: string;
  category: string;
  recommendationText: string;
  rationale: string;
  autoApplyValues: Record<string, unknown> | null;
}

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  onApply?: (values: Record<string, unknown> | null) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  onApply,
  onDismiss,
  className,
}: RecommendationCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20 p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {recommendation.recommendationText}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => setShowWhy(!showWhy)}
                  >
                    Why? {showWhy ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{recommendation.rationale}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {recommendation.autoApplyValues && Object.keys(recommendation.autoApplyValues).length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onApply?.(recommendation.autoApplyValues)}
              >
                <Check className="w-3 h-3" /> Apply
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => {
                setDismissed(true);
                onDismiss?.(recommendation.id);
              }}
            >
              <X className="w-3 h-3" /> Dismiss
            </Button>
          </div>
          {showWhy && (
            <p className="mt-2 text-xs text-muted-foreground border-t pt-2">
              {recommendation.rationale}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
