import { Metadata } from 'next';
import { HeroSection } from '@/components/why-sudaksha/HeroSection';
import { ComparisonTable } from '@/components/why-sudaksha/ComparisonTable';
import { EightReasons } from '@/components/why-sudaksha/EightReasons';
import { Methodology } from '@/components/why-sudaksha/Methodology';
import { AlumniTestimonials } from '@/components/why-sudaksha/AlumniTestimonials';
import { Guarantee } from '@/components/why-sudaksha/Guarantee';
import { RiskFreeTrial } from '@/components/why-sudaksha/RiskFreeTrial';
import { FinalCTA } from '@/components/why-sudaksha/FinalCTA';

export const metadata: Metadata = {
  title: 'Why Sudaksha - 85% Placement Rate, 6 LPA+ Salary | Career Transformation',
  description: 'Discover why 10,000+ students choose Sudaksha. Practitioner trainers, project-based learning, comprehensive placement support, and pay-after-placement options.',
  keywords: 'why sudaksha, placement guarantee, salary increase, career transformation, practitioner trainers, project based learning',
};

export default function WhySudakshaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <ComparisonTable />
      <EightReasons />
      <Methodology />
      <AlumniTestimonials />
      <Guarantee />
      <RiskFreeTrial />
      <FinalCTA />
    </div>
  );
}
