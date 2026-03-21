import { Metadata } from 'next';
import CorporateHero from '@/components/corporates/CorporateHero';
import ProblemSection from '@/components/corporates/ProblemSection';
import SudakshaSolution from '@/components/corporates/SudakshaSolution';
import TrainingModels from '@/components/corporates/TrainingModels';
import IndustryTrainingSolutions from '@/components/corporates/IndustryPreview'; // Mapped to the updated file
import DifferenceTable from '@/components/corporates/DifferenceTable';
import CorporateStats from '@/components/corporates/CorporateStats';
import ClientLogos from '@/components/corporates/ClientLogos';
import CaseStudiesPreview from '@/components/corporates/CaseStudiesPreview';
import ProcessTimeline from '@/components/corporates/ProcessTimeline';
import LearningDelivery from '@/components/corporates/LearningDelivery';
import ROICalculator from '@/components/corporates/ROICalculator';
import CorporateTestimonials from '@/components/corporates/CorporateTestimonials';
import CorporateFAQ from '@/components/corporates/CorporateFAQ';
import CorporateCTA from '@/components/corporates/CorporateCTA';
import StickySideCTA from '@/components/corporates/StickySideCTA';

export const metadata: Metadata = {
  title: 'Corporate Training Solutions | Sudaksha - Outcome-Driven IT Training for Enterprises',
  description: 'Transform your workforce with Sudaksha\'s custom corporate training. Train-Hire-Deploy models, industry-specific solutions, 92% client satisfaction. Trusted by 200+ companies.',
  openGraph: {
    title: 'Corporate Training Solutions | Sudaksha',
    description: 'Transform your workforce with Sudaksha\'s custom corporate training. Train-Hire-Deploy models, industry-specific solutions.',
    type: 'website',
  },
};

export default function CorporatesPage() {
  return (
    <div className="min-h-screen bg-white">
      <StickySideCTA />
      <CorporateHero />
      <ProblemSection />
      <SudakshaSolution />
      <TrainingModels />
      <IndustryTrainingSolutions />
      <DifferenceTable />
      <CorporateStats />
      <ClientLogos />
      <CaseStudiesPreview />
      <ProcessTimeline />
      <LearningDelivery />
      <ROICalculator />
      <CorporateTestimonials />
      <CorporateFAQ />
      <CorporateCTA />
    </div>
  );
}
