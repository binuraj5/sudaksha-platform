import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Domestic B2B Training Solutions | Sudaksha - Building India\'s Workforce',
  description: 'Transform your Indian workforce with Sudaksha\'s domestic B2B training solutions. IT & non-IT training, employment models, organizational transformation. 500+ programs delivered.',
  keywords: 'domestic B2B training, corporate training India, IT training, OB interventions, train-hire-deploy, organizational transformation',
};

export default function DomesticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
