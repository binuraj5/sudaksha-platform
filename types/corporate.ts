export interface TrainingModel {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  process: string[];
  useCases: string[];
  pricingModel: string;
  duration: string;
  cta: string;
  icon: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  slug: string;
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  photo: string;
  video?: string;
  quote: string;
  impactStats: {
    label: string;
    value: string;
  }[];
}

export interface ROICalculation {
  employees: number;
  averageSalary: number;
  productivityImprovement: number;
  duration: number;
  trainingCostPerEmployee: number;
  totalInvestment: number;
  annualProductivityGain: number;
  roiPercentage: number;
  breakEvenMonths: number;
  threeYearValue: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CorporateStats {
  employeesTrained: number;
  clientSatisfaction: number;
  productivityGain: number;
  industryVerticals: number;
  enterpriseClients: number;
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
  challenge: string;
  slug: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  duration: string;
  description: string;
  deliverable: string;
  icon: string;
}

export interface LearningDelivery {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  idealFor: string;
  icon: string;
}

export interface ContactForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  employeeCount: string;
  needs: string;
  preferredContact: 'email' | 'phone';
}

export interface CorporateNav {
  title: string;
  href: string;
  children?: CorporateNav[];
}
