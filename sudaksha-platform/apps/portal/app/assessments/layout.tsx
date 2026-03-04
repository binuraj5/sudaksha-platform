import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SudAssess - Talent Intelligence Platform',
  description: 'AI-driven competency management and assessment portal.',
};

export default function AssessmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

