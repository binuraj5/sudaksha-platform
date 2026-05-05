/**
 * ADAPT-16 Radar Chart — 16-axis competency profile visualisation
 * SEPL/INT/2026/IMPL-GAPS-01 Step G8
 * Patent claim C-06 T1 — individual learner report visual output
 */
'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface CompetencyScore {
  code: string;
  name: string;
  level: number;
}

interface Props {
  scores: CompetencyScore[];
  showLabels?: boolean;
}

const CODE_SHORT: Record<string, string> = {
  'A-01': 'Learn Agility', 'A-02': 'Cog Flexibility', 'A-03': 'Resilience', 'A-04': 'Ambiguity Tol.',
  'D-01': 'AI Literacy', 'D-02': 'Data Decisions', 'D-03': 'Digital Fluency',
  'AL-01': 'Collab Intel', 'AL-02': 'Social/EI', 'AL-03': 'Influence/Comm',
  'P-01': 'Growth Mindset', 'P-02': 'Metacognition', 'P-03': 'Values Decisions',
  'T-01': 'Critical Thinking', 'T-02': 'Systems Thinking', 'T-03': 'Creative Thinking',
};

export function ADAPT16RadarChart({ scores, showLabels = true }: Props) {
  if (!scores.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Complete ADAPT-16 assessment to see your radar chart
      </div>
    );
  }

  const data = scores.map((s) => ({
    subject: CODE_SHORT[s.code] ?? s.code,
    value: s.level,
    fullMark: 4,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--color-border-tertiary)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={showLabels ? { fontSize: 10, fill: 'var(--color-text-secondary)' } : false}
        />
        <Radar
          name="Your profile"
          dataKey="value"
          stroke="#7F77DD"
          fill="#7F77DD"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={((value: number) => [`Level ${value}`, 'Proficiency']) as any}
          contentStyle={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 8,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
