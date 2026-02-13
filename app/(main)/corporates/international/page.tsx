import { Metadata } from 'next';
import InternationalHero from '@/components/corporates/InternationalHero';
import WhySudakshaInternational from '@/components/corporates/WhySudakshaInternational';
import BrainCirculationVision from '@/components/corporates/BrainCirculationVision';
import AfricaMenaFocus from '@/components/corporates/AfricaMenaFocus';
import RegionalHubsPresence from '@/components/corporates/RegionalHubsPresence';
import InnovativeDeliveryModels from '@/components/corporates/InnovativeDeliveryModels';
import ProjectsShowcase from '@/components/corporates/ProjectsShowcase';
import ProjectStatisticsDashboard from '@/components/corporates/ProjectStatisticsDashboard';
import ComplianceStandards from '@/components/corporates/ComplianceStandards';
import TrainingPartnerships from '@/components/corporates/TrainingPartnerships';

export const metadata: Metadata = {
  title: 'International B2B Solutions - Sudaksha',
  description: 'Building global digital capability from India to the world. Partnering with governments, enterprises, and NGOs across Africa, MENA, and Latin America.',
};

export default function InternationalPage() {
  return (
    <div className="min-h-screen">
      <InternationalHero />
      <WhySudakshaInternational />
      <BrainCirculationVision />
      <AfricaMenaFocus />
      <RegionalHubsPresence />
      <InnovativeDeliveryModels />
      <ProjectsShowcase />
      <ProjectStatisticsDashboard />
      <TrainingPartnerships />
      <ComplianceStandards />
      {/* All sections integrated */}
    </div>
  );
}
