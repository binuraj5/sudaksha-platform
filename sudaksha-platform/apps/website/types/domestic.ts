// TypeScript interfaces for Domestic B2B Training Solutions Page

export interface ValueProposition {
  id: string;
  text: string;
  icon?: string;
}

export interface HeroSection {
  eyebrow: string;
  headline: string;
  subheadline: string;
  valuePropositions: ValueProposition[];
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA: {
    text: string;
    href: string;
  };
  trustBanner: string;
  heroVisual: {
    leftImage: string;
    rightImage: string;
    centerOverlay: string;
  };
}

export interface ComparisonAspect {
  aspect: string;
  traditional: string;
  sudaksha: string;
}

export interface DifferentiatorSection {
  headline: string;
  comparisons: ComparisonAspect[];
}

export interface EcosystemCapability {
  title: string;
  items: string[];
}

export interface TrainingEcosystem {
  headline: string;
  innerCircle: EcosystemCapability;
  middleCircle: EcosystemCapability;
  outerCircle: EcosystemCapability;
  bottomText: string;
}

export interface Program {
  title: string;
  duration: string;
  hours?: number;
}

export interface TrainingCategory {
  id: string;
  title: string;
  icon: string;
  coverage: string;
  whatWeCover: string[];
  typicalPrograms: Program[];
  businessOutcomes: string[];
  cta: {
    text: string;
    href: string;
  };
}

export interface CurationStep {
  step: number;
  title: string;
  duration: string;
  activities: string[];
  deliverable: string;
  specialNotes?: string;
}

export interface CurationProcess {
  headline: string;
  subheadline: string;
  steps: CurationStep[];
}

export interface EmploymentPhase {
  title: string;
  duration: string;
  activities: string[];
}

export interface EmploymentModel {
  title: string;
  bestFor: string[];
  phases: EmploymentPhase[];
  investmentModel: {
    description: string;
    details: string[];
  };
  successMetrics: {
    label: string;
    value: string;
  }[];
  caseStudyPreview: {
    title: string;
    results: string[];
  };
  cta: {
    text: string;
    href: string;
  };
}

export interface TransformationPillar {
  title: string;
  whatItIs: string;
  whenYouNeedIt: string[];
  approach: string[];
  typicalDuration: string;
  cta: {
    text: string;
    href: string;
  };
}

export interface LearningMonth {
  month: number;
  title: string;
  technical: {
    title: string;
    hours: number;
    topics: string[];
  };
  behavioral: {
    title: string;
    hours: number;
    topics: string[];
  };
}

export interface LearningJourney {
  headline: string;
  scenario: string;
  months: LearningMonth[];
  result: string;
}

export interface DeliveryOption {
  title: string;
  features: string[];
  bestFor: string;
}

export interface PricingModel {
  title: string;
  description: string;
  suitableFor: string;
  example: string;
  minimum?: string;
  includes?: string[];
}

export interface SuccessMetric {
  category: string;
  metrics: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  client: {
    name: string;
    size: string;
    industry: string;
  };
  challenge: string[];
  solution: {
    phases: {
      title: string;
      description: string;
      details: string[];
    }[];
  };
  investment: {
    total: string;
    breakdown: string;
  };
  results: {
    timeframe: string;
    metrics: {
      label: string;
      before: string;
      after: string;
    }[];
  };
  roi: {
    calculation: string[];
    totalBenefit: string;
    percentage: string;
    timeframe: string;
  };
  clientQuote: {
    text: string;
    author: string;
    title: string;
  };
  cta: {
    text: string;
    href: string;
  };
}

export interface FAQ {
  category: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

export interface ActionCard {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  features?: string[];
}

export interface FinalCTA {
  headline: string;
  subheadline: string;
  actionCards: ActionCard[];
  contact: {
    phone: string;
    email: string;
    hours: string;
  };
}

export interface DomesticPageData {
  hero: HeroSection;
  differentiator: DifferentiatorSection;
  ecosystem: TrainingEcosystem;
  trainingCategories: TrainingCategory[];
  curationProcess: CurationProcess;
  employmentModels: {
    thd: EmploymentModel;
    htd: EmploymentModel;
  };
  transformation: {
    headline: string;
    pillars: TransformationPillar[];
  };
  learningJourney: LearningJourney;
  deliveryFormats: {
    headline: string;
    options: DeliveryOption[];
  };
  pricingModels: {
    headline: string;
    models: PricingModel[];
    addOnServices: {
      service: string;
      price: string;
    }[];
  };
  successMetrics: {
    headline: string;
    categories: SuccessMetric[];
  };
  caseStudies: CaseStudy[];
  faq: FAQ;
  finalCTA: FinalCTA;
}
