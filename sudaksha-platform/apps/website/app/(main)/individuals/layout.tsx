import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Individuals - Sudaksha | Career Transformation Programs',
  description: 'Transform your career with Sudaksha\'s industry-focused training programs for freshers, working professionals, and career switchers.',
};

export default function IndividualsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
