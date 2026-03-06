export const SITE_NAME = 'Sudaksha'
export const SITE_TAGLINE = 'Talent Architecture & Organizational Development'
export const SITE_DESCRIPTION =
  'AI-powered competency assessment, organizational development, and talent architecture. Powered by Samyak™.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sudaksha.com'

export const BRAND_TAGLINE = 'Talent by Design. Performance by Science.'
export const HERO_H1 = "We don't train people. We transform organizations."

export const IMPACT_STEPS = [
  {
    letter: 'I',
    stage: '01',
    title: 'Investigate',
    short: 'Diagnose the real capability gap.',
    long: 'We begin every engagement with deep diagnostic work — behavioural assessments, competency mapping, and organizational profiling. We do not assume. We measure.',
  },
  {
    letter: 'M',
    stage: '02',
    title: 'Map',
    short: 'Chart the terrain from current to ideal.',
    long: 'Using Samyak™, we generate precise competency maps — individual, team, and organisational — so you know exactly where performance gaps exist and why.',
  },
  {
    letter: 'P',
    stage: '03',
    title: 'Prescribe',
    short: 'Design the right intervention.',
    long: 'Not every gap needs training. Some need role redesign, culture work, or structural change. We prescribe the most direct route from gap to performance.',
  },
  {
    letter: 'A',
    stage: '04',
    title: 'Act',
    short: 'Deploy with discipline.',
    long: 'Implementation is where most OD work fails. We stay with you through deployment — ensuring adoption, measuring resistance, and adjusting in real time.',
  },
  {
    letter: 'C',
    stage: '05',
    title: 'Commit',
    short: 'Embed capability into the organisation.',
    long: 'True transformation is irreversible. We build internal capability — training managers, designing systems, creating feedback loops that sustain the change.',
  },
  {
    letter: 'T',
    stage: '06',
    title: 'Transform',
    short: 'Prove the outcome.',
    long: 'We do not leave without measuring the result. ROI on capability. Productivity lifts. Talent retention. The numbers that prove transformation happened.',
  },
] as const

export const NAV_LINKS = [
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Institutions', href: '/institutions' },
  { label: 'Professionals', href: '/professionals' },
  { label: 'Samyak™', href: '/samyak', highlight: true },
  { label: 'Thinking', href: '/thinking' },
  { label: 'About', href: '/about' },
] as const

export const SECTORS = [
  { icon: '🏦', label: 'Banking & Finance' },
  { icon: '🏥', label: 'Healthcare' },
  { icon: '🏛️', label: 'Government' },
  { icon: '🎓', label: 'Education' },
  { icon: '🔬', label: 'Technology' },
  { icon: '🏭', label: 'Manufacturing' },
  { icon: '🛒', label: 'Retail & FMCG' },
  { icon: '✈️', label: 'Aviation & Transport' },
] as const

export const SCIP_DIMENSIONS = [
  {
    code: 'S',
    title: 'Self-Concept',
    color: '#1565c0',
    desc: 'How you see yourself as a professional — your identity, values, and self-efficacy beliefs that drive career choices.',
  },
  {
    code: 'C',
    title: 'Competency Profile',
    color: '#f5a023',
    desc: 'A structured mapping of your demonstrated capabilities across cognitive, behavioural, and technical domains.',
  },
  {
    code: 'I',
    title: 'Interest Alignment',
    color: '#2196f3',
    desc: 'Where your natural interests and Holland-coded work preferences align with real career trajectories.',
  },
  {
    code: 'P',
    title: 'Personality Traits',
    color: '#1976d2',
    desc: 'Your core personality dimensions and how they shape your work style, leadership approach, and team dynamics.',
  },
  {
    code: '™',
    title: 'Career Intelligence',
    color: '#64b5f6',
    desc: 'Integrated intelligence — how all four dimensions combine to prescribe your optimal career architecture.',
  },
] as const
