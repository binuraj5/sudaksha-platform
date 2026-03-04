export interface AudienceCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  theme: 'blue' | 'orange' | 'green';
  benefits: string[];
  cta: string;
  link: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Industry {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  slug: string;
}

export interface ComparisonData {
  traditional: string;
  online: string;
  sudaksha: string;
}

export interface StatItem {
  value: string;
  label: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  previousRole: string;
  currentRole: string;
  salaryTransformation: string;
  companyLogo: string;
  rating: number;
  course: string;
  quote: string;
}

export interface LearningFormat {
  id: string;
  title: string;
  icon: string;
  benefits: string[];
}

export interface CorporateClient {
  id: string;
  name: string;
  logo: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  slug: string;
}

export interface Certification {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface HomeStats {
  studentsTrained: number;
  placementRate: number;
  averageSalary: number;
  corporatePartners: number;
  industryVerticals: number;
}
