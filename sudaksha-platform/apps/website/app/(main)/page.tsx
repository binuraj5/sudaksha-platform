import { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { AnnouncementStrip } from '@/components/home/AnnouncementStrip';
import { AudienceSelector } from '@/components/home/AudienceSelector';
import { CourseRecommendations } from '@/components/home/CourseRecommendations';
import { StatisticsBar } from '@/components/home/StatisticsBar';
import { OurWorkPreview } from '@/components/home/OurWorkPreview';
import { FinalCTA } from '@/components/home/FinalCTA';

export const metadata: Metadata = {
  title: 'Sudaksha - Bridging Academic Output & Industry Demand | IT Training & Placement',
  description:
    "Transform your career with Sudaksha's outcome-driven training programs. 85%+ placement rate, 6 LPA+ starting salaries. Finishing school for freshers, upskilling for professionals.",
  keywords:
    'IT training, placement, career transformation, finishing school, corporate training, tech skills',
  openGraph: {
    title: 'Sudaksha - Bridging Academic Output & Industry Demand',
    description: 'Transform your career with outcome-driven training programs',
    type: 'website',
    url: 'https://sudaksha.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sudaksha - Bridging Academic Output & Industry Demand',
    description: 'Transform your career with outcome-driven training programs',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <AnnouncementStrip />
      <AudienceSelector />
      <CourseRecommendations />
      <OurWorkPreview />
      <StatisticsBar />
      <FinalCTA />
    </div>
  );
}

