export type AudienceType = 'corporate' | 'institution' | 'individual' | 'general';

export type CTAIntent =
  | 'schedule_call'       // "Schedule Strategy Session", "Schedule Discovery Call"
  | 'download_brochure'   // "Download Corporate Brochure"
  | 'get_proposal'        // "Request Proposal", "Request Custom Proposal"
  | 'enquire_program'     // "Enquire" on a specific program card
  | 'campus_assessment'   // "Schedule Campus Assessment"
  | 'career_counseling'   // "Talk to Career Counselor"
  | 'free_assessment'     // "Take Free Assessment" (career switchers)
  | 'roi_analysis'        // "Get Detailed ROI Analysis"
  | 'discuss_industry'    // "Discuss Your Industry"
  | 'talk_to_expert'      // "Talk to an Expert"
  | 'design_program'      // "Design Your Program"
  | 'start_process'       // "Start Discovery Process"
  | 'general_contact';    // Fallback for unclassified CTAs

export interface CTAContext {
  page: string;           // e.g. "Corporates"
  pageUrl: string;        // e.g. "/corporates"
  section: string;        // e.g. "Six-Sigma Curation Process"
  ctaLabel: string;       // e.g. "Start Discovery Process"
  audienceType: AudienceType;
  intent: CTAIntent;
  prefill?: {
    industry?: string;
    program?: string;
    model?: string;
    partnershipModel?: string;
    subject?: string;     // Override subject line completely
  };
}

export interface LeadFormData {
  // Universal — all forms
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  // Corporate
  companyName?: string;
  designation?: string;
  teamSize?: string;
  trainingNeed?: string;
  // Institution
  institutionName?: string;
  institutionType?: string;
  studentCount?: string;
  currentPlacementRate?: string;
  // Individual
  currentStatus?: string;
  currentRole?: string;
  experienceYears?: string;
  programOfInterest?: string;
}
