import { ArrowRight, Users, TrendingUp, Building, Target } from 'lucide-react';
import Link from 'next/link';
import { HeroClient } from './HeroClient';

async function getActiveHero() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/homepage/hero`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.heroes?.find((h: any) => h.isActive) || null;
  } catch {
    return null;
  }
}

const fallbackHero = {
  headline: 'Bridging Academic Output',
  subHeadline: 'and Industry Demand',
  badge: 'India\'s Leading Talent Transformation Platform',
  description: 'Not just training. Strategic capability building for digital workforce.',
  primaryCtaLabel: 'Explore Programs',
  primaryCtaUrl: '/courses',
  secondaryCtaLabel: 'Book Free Consultation',
  textTheme: 'DARK' as const,
};

const floatingStats = [
  { value: '50,000+', label: 'Students Trained', iconName: 'Users' },
  { value: '85%+', label: 'Placement Rate', iconName: 'TrendingUp' },
  { value: '200+', label: 'Corporate Partners', iconName: 'Building' },
  { value: '12', label: 'Industry Verticals', iconName: 'Target' }
];

export async function Hero() {
  const activeHero = await getActiveHero();

  const heroData = activeHero ? {
    headline: activeHero.headline,
    subHeadline: activeHero.subHeadline || activeHero.description,
    badge: activeHero.badgeText,
    description: activeHero.subHeadline || activeHero.description,
    primaryCtaLabel: activeHero.primaryCtaLabel,
    primaryCtaUrl: activeHero.primaryCtaUrl,
    secondaryCtaLabel: activeHero.secondaryCtaLabel,
    secondaryCtaUrl: activeHero.secondaryCtaUrl,
    textTheme: activeHero.textTheme,
    backgroundType: activeHero.backgroundType,
    backgroundValue: activeHero.backgroundValue,
    overlayOpacity: activeHero.overlayOpacity,
  } : fallbackHero;

  const getBackgroundStyle = () => {
    if (activeHero?.backgroundType === 'COLOR' && activeHero.backgroundValue) {
      return { background: activeHero.backgroundValue };
    }
    if (activeHero?.backgroundType === 'IMAGE' && activeHero.backgroundValue) {
      return { backgroundImage: `url(${activeHero.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    if (activeHero?.backgroundType === 'GRADIENT' && activeHero.backgroundValue) {
      return { background: activeHero.backgroundValue };
    }
    // Default: light blue gradient (original styling)
    return { background: 'linear-gradient(to bottom right, rgb(240, 249, 255), rgb(255, 255, 255), rgb(238, 242, 255))' };
  };

  return (
    <div className="relative min-h-[60vh] overflow-hidden" style={getBackgroundStyle()}>
      {!activeHero && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl"></div>
        </div>
      )}

      {activeHero?.backgroundType === 'IMAGE' && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: activeHero.overlayOpacity || 0.5 }}
        />
      )}

      <HeroClient
        headline={heroData.headline}
        subHeadline={heroData.subHeadline}
        badge={heroData.badge}
        primaryCtaLabel={heroData.primaryCtaLabel}
        primaryCtaUrl={heroData.primaryCtaUrl}
        secondaryCtaLabel={heroData.secondaryCtaLabel}
        secondaryCtaUrl={heroData.secondaryCtaUrl}
        textTheme={heroData.textTheme}
        stats={floatingStats}
      />
    </div>
  );
}
