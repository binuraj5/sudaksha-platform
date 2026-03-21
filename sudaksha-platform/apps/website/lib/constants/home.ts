import { AudienceCard, ProcessStep, Industry, ComparisonData, StatItem, LearningFormat } from '../../types/home';

export const AUDIENCE_CARDS: AudienceCard[] = [
  {
    id: 'corporates',
    title: 'For Corporates',
    subtitle: 'Build Custom Tech Teams & Scale Innovation',
    icon: 'Building',
    theme: 'blue',
    benefits: [
      'Six-Sigma precision curation model',
      'Train-Hire-Deploy & Deploy-Hire-Train models',
      'Industry-specific training across 12 verticals'
    ],
    cta: 'Explore Corporate Solutions',
    link: '/for-corporates'
  },
  {
    id: 'individuals',
    title: 'For Individuals',
    subtitle: 'From 0 LPA to 6 LPA+ in 320 Hours',
    icon: 'User',
    theme: 'orange',
    benefits: [
      'Finishing School programs for freshers',
      'Upskilling for working professionals',
      'Career switching pathways'
    ],
    cta: 'Start Your Journey',
    link: '/for-individuals'
  },
  {
    id: 'institutions',
    title: 'For Institutions',
    subtitle: 'Transform from Degree-Awarding to Career-Launching',
    icon: 'GraduationCap',
    theme: 'green',
    benefits: [
      'Curriculum mapping services',
      'Placement Probability (PP) Index',
      'Direct-to-Corporate pipeline'
    ],
    cta: 'Partner With Us',
    link: '/for-institutions'
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'objective',
    title: 'OBJECTIVE RECEIPT',
    description: 'Deep-dive into business goals and problems to solve',
    icon: 'Target'
  },
  {
    id: 'curation',
    title: 'CURATION & DESIGN',
    description: 'Custom curriculum mapped to your tech stack',
    icon: 'Settings'
  },
  {
    id: 'assessment',
    title: 'OUTCOME ASSESSMENT',
    description: 'Define success metrics before training begins',
    icon: 'ClipboardCheck'
  },
  {
    id: 'trainer',
    title: 'TRAINER MATCHING',
    description: 'Match with practitioner SMEs, not just lecturers',
    icon: 'UserCheck'
  },
  {
    id: 'execution',
    title: 'EXECUTION & REPORTING',
    description: 'Daily conduct reports for complete transparency',
    icon: 'Activity'
  },
  {
    id: 'closure',
    title: 'DATA-DRIVEN CLOSURE',
    description: 'Measurable competency improvement metrics',
    icon: 'BarChart'
  }
];

export const INDUSTRIES: Industry[] = [
  { id: 'fintech', name: 'FinTech', tagline: 'Banking & Financial Services', icon: 'CreditCard', color: 'blue', slug: 'fintech' },
  { id: 'ecommerce', name: 'E-commerce', tagline: 'Digital Retail & Marketplaces', icon: 'ShoppingCart', color: 'purple', slug: 'ecommerce' },
  { id: 'healthcare', name: 'Healthcare', tagline: 'Medical & Health Services', icon: 'Heart', color: 'red', slug: 'healthcare' },
  { id: 'pharma', name: 'Pharma', tagline: 'Pharmaceutical & Biotech', icon: 'Pill', color: 'green', slug: 'pharma' },
  { id: 'logistics', name: 'Logistics & Supply Chain', tagline: 'Transportation & Distribution', icon: 'Truck', color: 'orange', slug: 'logistics' },
  { id: 'edtech', name: 'EdTech', tagline: 'Education Technology', icon: 'BookOpen', color: 'indigo', slug: 'edtech' },
  { id: 'government', name: 'Government', tagline: 'Public Sector Services', icon: 'Building', color: 'gray', slug: 'government' },
  { id: 'defence', name: 'Defence', tagline: 'Defense & Security', icon: 'Shield', color: 'darkblue', slug: 'defence' },
  { id: 'aviation', name: 'Aviation', tagline: 'Airlines & Aerospace', icon: 'Plane', color: 'sky', slug: 'aviation' },
  { id: 'travel', name: 'Travel & Hospitality', tagline: 'Tourism & Hotels', icon: 'MapPin', color: 'teal', slug: 'travel' },
  { id: 'retail', name: 'Retail & FMCG', tagline: 'Consumer Goods & Retail', icon: 'Package', color: 'pink', slug: 'retail' },
  { id: 'realestate', name: 'Real Estate', tagline: 'Property & Construction', icon: 'Home', color: 'amber', slug: 'realestate' }
];

export const COMPARISON_DATA: ComparisonData[] = [
  {
    traditional: 'Off-the-shelf courses',
    online: 'University partnerships',
    sudaksha: 'Custom precision curation'
  },
  {
    traditional: 'Generic content',
    online: 'Cohort-based learning',
    sudaksha: 'Tech-stack aligned programs'
  },
  {
    traditional: 'Attendance metrics',
    online: 'Completion certificates',
    sudaksha: 'Outcome-based assessment'
  },
  {
    traditional: 'No placement integration',
    online: 'Placement assistance',
    sudaksha: 'Employment integration (THD/DHT)'
  },
  {
    traditional: 'Static curriculum',
    online: 'Quarterly updates',
    sudaksha: 'Closed-loop daily feedback'
  },
  {
    traditional: 'Generic trainers',
    online: 'Certified instructors',
    sudaksha: 'Industry practitioners (SMEs)'
  },
  {
    traditional: 'Single training mode',
    online: 'Multiple formats',
    sudaksha: 'Full lifecycle support'
  }
];

export const STATISTICS: StatItem[] = [
  { value: '18+', label: 'Years of Excellence', icon: 'Calendar' },
  { value: '50K', label: 'Students Trained', icon: 'Users' },
  { value: '30K', label: 'Professionals Trained', icon: 'Award' },
  { value: '3K', label: 'Expert Trainers', icon: 'UserCheck' },
  { value: '200+', label: 'Corporate Partners', icon: 'Building' }
];

export const LEARNING_FORMATS: LearningFormat[] = [
  {
    id: 'live-online',
    title: 'LIVE ONLINE',
    icon: 'Video',
    benefits: [
      'Real-time instructor interaction',
      'Attend from anywhere',
      'Recorded sessions included'
    ]
  },
  {
    id: 'weekend',
    title: 'WEEKEND BATCHES',
    icon: 'Calendar',
    benefits: [
      'Perfect for working professionals',
      'Saturday-Sunday intensive',
      'No career interruption'
    ]
  },
  {
    id: 'bootcamp',
    title: 'INTENSIVE BOOTCAMPS',
    icon: 'Zap',
    benefits: [
      'Fast-track learning',
      'Full immersion',
      'Complete programs in weeks'
    ]
  },
  {
    id: 'corporate',
    title: 'CORPORATE CUSTOMIZED',
    icon: 'Building',
    benefits: [
      'On-site or online',
      'Custom curriculum',
      'Bulk training solutions'
    ]
  }
];

export const CORPORATE_CLIENTS = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini',
  'Amazon', 'Microsoft', 'Google', 'IBM', 'Oracle',
  'Flipkart', 'Swiggy', 'Zomato', 'Paytm', 'PhonePe',
  'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak',
  'Reliance', 'Tata', 'Mahindra', 'Bajaj', 'L&T',
  'Biocon', 'Dr. Reddy\'s', 'Sun Pharma', 'Cipla', 'Lupin',
  'Ola', 'Uber', 'MakeMyTrip', 'Booking.com', 'Agoda'
];
