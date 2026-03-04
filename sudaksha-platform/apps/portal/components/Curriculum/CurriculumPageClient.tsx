"use client";

import { useState } from "react";
import { CurriculumManager } from "@/components/Curriculum/CurriculumManager";
import { StreamIndustryPresets } from "@/components/Curriculum/StreamIndustryPresets";

export function CurriculumPageClient({ clientId }: { clientId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Stream & Industry Presets</h2>
        <p className="text-sm text-gray-500 mb-4">
          Add programs from presets for employability alignment, or use industry tags when linking courses.
        </p>
        <StreamIndustryPresets
          clientId={clientId}
          onStreamCreated={() => setRefreshKey((k) => k + 1)}
        />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Curriculum Hierarchy</h2>
        <CurriculumManager clientId={clientId} refreshKey={refreshKey} />
      </section>
    </div>
  );
}
