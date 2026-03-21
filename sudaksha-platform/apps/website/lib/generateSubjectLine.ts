import { CTAContext, CTAIntent, AudienceType } from '@/types/cta';

export const intentLabels: Record<CTAIntent, string> = {
  schedule_call:      'Call Request',
  download_brochure:  'Brochure Download',
  get_proposal:       'Proposal Request',
  enquire_program:    'Program Enquiry',
  campus_assessment:  'Campus Assessment Request',
  career_counseling:  'Counseling Request',
  free_assessment:    'Free Assessment Request',
  roi_analysis:       'ROI Analysis Request',
  discuss_industry:   'Industry Discussion',
  talk_to_expert:     'Expert Call Request',
  design_program:     'Program Design Request',
  start_process:      'Discovery Process Request',
  general_contact:    'General Enquiry',
};

const audiencePrefix: Record<AudienceType, string> = {
  corporate:   '[Corporate]',
  institution: '[Institution]',
  individual:  '[Individual]',
  general:     '[General]',
};

export function generateSubjectLine(ctx: CTAContext): string {
  if (ctx.prefill?.subject) return ctx.prefill.subject;
  const prefix = audiencePrefix[ctx.audienceType];
  const industry = ctx.prefill?.industry ? ` — ${ctx.prefill.industry}` : '';
  const program  = ctx.prefill?.program  ? ` — ${ctx.prefill.program}`  : '';
  const model    = ctx.prefill?.partnershipModel ? ` — ${ctx.prefill.partnershipModel}` : '';
  return `${prefix} ${ctx.page} › ${ctx.section} › "${ctx.ctaLabel}"${industry}${program}${model}`;
}
