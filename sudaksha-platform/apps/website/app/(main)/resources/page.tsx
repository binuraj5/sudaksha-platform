import { Metadata } from 'next';
import { HeroSection } from '@/components/resources/HeroSection';
import { QuickLinksGrid } from '@/components/resources/QuickLinksGrid';
import { FeaturedBlogPosts } from '@/components/resources/FeaturedBlogPosts';
import { WebinarsEvents } from '@/components/resources/WebinarsEvents';
import { QuickFAQ } from '@/components/resources/QuickFAQ';
import { VideoTestimonial } from '@/components/resources/VideoTestimonial';
import { CTASection } from '@/components/resources/CTASection';

export const metadata: Metadata = {
  title: 'Resources - Career Roadmaps, Tools & Guides | Sudaksha',
  description: 'Free tools, guides, and insights to help you choose, prepare, and succeed in your tech career journey. Career assessments, salary guides, interview prep, and more.',
  keywords: 'career roadmap, skill assessment, salary guide, interview preparation, tech resources, career guidance',
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <QuickLinksGrid />
      <FeaturedBlogPosts />
      <WebinarsEvents />
      <QuickFAQ />
      <VideoTestimonial />
      <CTASection />
    </div>
  );
}
