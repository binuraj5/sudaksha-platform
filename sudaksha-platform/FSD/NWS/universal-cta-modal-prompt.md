# PROMPT: Universal CTA Modal + Admin Communication & Audit System
## Sudaksha.com — One form. Every CTA. Full admin visibility.

---

## WHAT THIS BUILDS

A single `<CTAModal />` component that:
1. Opens from **any CTA button** on any page with full context passed in
2. Adapts its fields based on **audience type** (Corporate / Institution / Individual)
3. Generates a smart **subject line** from Page + Section + CTA clicked
4. Submits the lead and writes to:
   - `/admin/communication` — every lead/enquiry in a readable inbox-style log
   - `/admin/audit` — every action (open, submit, abandon, error) as an immutable audit trail
5. Sends an **email notification** to the Sudaksha team on submission

---

## FULL FILE LIST TO CREATE / MODIFY

### NEW FILES
```
types/cta.ts                          ← All TypeScript types for this system
context/CTAModalContext.tsx           ← Global modal state (React Context)
hooks/useCTAModal.ts                  ← Hook: openModal(config) from anywhere
components/universal/CTAModal.tsx     ← The modal UI component
components/universal/CTAModal.module.css
components/universal/CTAButton.tsx    ← Drop-in CTA button that calls openModal()
lib/generateSubjectLine.ts            ← Smart subject line generator
lib/submitLead.ts                     ← Client-side API call helper
lib/auditLog.ts                       ← Client-side audit event helper
pages/api/submit-lead.ts              ← POST: save lead + send email
pages/api/audit-event.ts             ← POST: write audit event
pages/api/admin/leads.ts             ← GET: paginated leads for admin
pages/api/admin/audit.ts             ← GET: paginated audit events for admin
pages/admin/index.tsx                ← Admin dashboard (stats + quick links)
pages/admin/communication.tsx        ← Admin inbox for all leads/enquiries
pages/admin/audit.tsx                ← Admin audit trail page
pages/admin/login.tsx                ← Admin login page
middleware/adminAuth.ts               ← Protect /admin/* routes
```

### MODIFIED FILES
```
pages/_app.tsx                        ← Add <CTAModalProvider> + <CTAModal />
Every page/section with CTA buttons   ← Replace <a href> / <button> with <CTAButton>
```

---

## STEP 1 — TYPE DEFINITIONS
### `types/cta.ts`

```typescript
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

export interface LeadRecord {
  id: string;
  createdAt: string;
  subjectLine: string;
  ctaContext: CTAContext;
  formData: LeadFormData;
  status: 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed';
  assignedTo?: string;
  notes?: string;
  emailSent: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'modal_opened'
    | 'modal_abandoned'
    | 'form_submitted'
    | 'form_error'
    | 'email_sent'
    | 'email_failed'
    | 'admin_viewed'
    | 'admin_status_updated'
    | 'admin_note_added';
  ctaContext?: CTAContext;
  leadId?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  ipAddress?: string;
}
```

---

## STEP 2 — SUBJECT LINE GENERATOR
### `lib/generateSubjectLine.ts`

```typescript
import { CTAContext, CTAIntent, AudienceType } from '@/types/cta';

const intentLabels: Record<CTAIntent, string> = {
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

// GENERATED EXAMPLES:
// [Corporate] Corporates › Hero › "Schedule Strategy Session"
// [Corporate] Corporates › Industry Training Solutions › "Design Your FinTech Training Program" — FinTech
// [Corporate] Corporates › ROI Calculator › "Get Detailed ROI Analysis"
// [Institution] Institutions › Partnership Models › "Learn More" — Co-Branded Finishing School
// [Institution] Institutions › Hero › "Schedule Campus Assessment"
// [Individual] Individuals › Career-Launch Programs › "Enquire" — MERN Stack
// [Individual] Individuals › Career Switchers › "Take Free Assessment"
```

---

## STEP 3 — CONTEXT PROVIDER
### `context/CTAModalContext.tsx`

```typescript
'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CTAContext } from '@/types/cta';

interface CTAModalContextValue {
  isOpen: boolean;
  ctaContext: CTAContext | null;
  openModal: (ctx: CTAContext) => void;
  closeModal: () => void;
}

const CTAModalContext = createContext<CTAModalContextValue | null>(null);

export function CTAModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ctaContext, setCTAContext] = useState<CTAContext | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const openModal = useCallback((ctx: CTAContext) => {
    setCTAContext(ctx);
    setSubmitted(false);
    setIsOpen(true);
    fetch('/api/audit-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'modal_opened', ctaContext: ctx }),
    });
  }, []);

  const closeModal = useCallback(() => {
    if (!submitted && ctaContext) {
      fetch('/api/audit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'modal_abandoned', ctaContext }),
      });
    }
    setIsOpen(false);
  }, [ctaContext, submitted]);

  const markSubmitted = useCallback(() => setSubmitted(true), []);

  return (
    <CTAModalContext.Provider value={{ isOpen, ctaContext, openModal, closeModal, markSubmitted }}>
      {children}
    </CTAModalContext.Provider>
  );
}

export function useCTAModalContext() {
  const ctx = useContext(CTAModalContext);
  if (!ctx) throw new Error('useCTAModalContext must be used within CTAModalProvider');
  return ctx;
}
```

---

## STEP 4 — CTAButton COMPONENT
### `components/universal/CTAButton.tsx`

Drop-in replacement for every `<a href>`, `<button>`, or `<Link>` CTA on the site.

```typescript
'use client';
import { useCTAModalContext } from '@/context/CTAModalContext';
import { CTAContext } from '@/types/cta';

interface CTAButtonProps {
  ctx: CTAContext;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export function CTAButton({ ctx, children, className, variant = 'primary' }: CTAButtonProps) {
  const { openModal } = useCTAModalContext();
  return (
    <button
      className={`cta-btn cta-btn--${variant} ${className || ''}`}
      onClick={() => openModal(ctx)}
    >
      {children}
    </button>
  );
}
```

### Usage examples:

```tsx
// BEFORE (current):
<a href="/contact">Schedule Strategy Session</a>

// AFTER:
<CTAButton ctx={{
  page: 'Corporates',
  pageUrl: '/corporates',
  section: 'Hero',
  ctaLabel: 'Schedule Strategy Session',
  audienceType: 'corporate',
  intent: 'schedule_call',
}}>
  Schedule Strategy Session
</CTAButton>

// With industry prefill (from industry training section):
<CTAButton ctx={{
  page: 'Corporates',
  pageUrl: '/corporates',
  section: 'Industry-Specific Training Solutions',
  ctaLabel: 'Design Your FinTech Training Program',
  audienceType: 'corporate',
  intent: 'design_program',
  prefill: { industry: 'FinTech' },
}}>
  Design Your FinTech Training Program →
</CTAButton>

// With program prefill (from individual program card):
<CTAButton ctx={{
  page: 'Individuals',
  pageUrl: '/individuals',
  section: 'Career-Launch Programs',
  ctaLabel: 'Enquire',
  audienceType: 'individual',
  intent: 'enquire_program',
  prefill: { program: 'MERN Stack (300 Hours)' },
}}>
  Enquire
</CTAButton>
```

---

## STEP 5 — MODAL COMPONENT SPEC
### `components/universal/CTAModal.tsx`

### Design (match sudaksha.com design system):
- Backdrop: `rgba(0,0,0,0.78)` with `backdrop-filter: blur(6px)`
- Card: `background: #111118`, `border: 1px solid rgba(255,255,255,0.08)`, `border-radius: 20px`
- Top border accent: `3px solid` in audience color (see below)
- Max width: `560px`, centered, scrollable on mobile
- Escape key + click outside → close modal
- Prevent body scroll while open

### Audience accent colours:
| Audience | Colour | Use |
|----------|--------|-----|
| corporate | `#00d4ff` (blue) | Top border, submit button, focus rings |
| institution | `#f5a623` (gold) | Top border, submit button, focus rings |
| individual | `#a78bfa` (violet) | Top border, submit button, focus rings |
| general | `#ffffff` | Neutral white |

### Modal header (dynamic):
Shows the resolved title based on `intent`, plus a breadcrumb:
```
[Intent Title]                    ×
Corporates  ›  Six-Sigma Process  ›  "Start Discovery Process"
[audience badge: CORPORATE]
```

### Intent → Modal title mapping:
```
schedule_call      → "Schedule a Strategy Session"
download_brochure  → "Download the Brochure"
get_proposal       → "Request a Custom Proposal"
enquire_program    → "Enquire About This Program"
campus_assessment  → "Schedule a Campus Assessment"
career_counseling  → "Book a Career Counseling Session"
free_assessment    → "Start Your Free Assessment"
roi_analysis       → "Get a Detailed ROI Analysis"
discuss_industry   → "Discuss Your Industry Needs"
talk_to_expert     → "Talk to an Expert"
design_program     → "Design Your Training Program"
start_process      → "Start the Discovery Process"
general_contact    → "Get in Touch"
```

### Form fields by audience:

#### Universal (always shown):
- Full Name* `[text]`
- Email Address* `[email]`
- Phone Number* `[tel]` with +91 prefix
- Message / Notes `[textarea, optional]` — placeholder adapts to intent

#### Corporate (additional):
- Company Name* `[text]`
- Your Designation* `[text]` e.g. "VP Engineering", "L&D Head"
- Team Size `[select]`: 5–20 | 21–50 | 51–200 | 201–500 | 500+
- Training Need `[select]`: Tech Upskilling | Leadership | Compliance | New Hire Onboarding | Other
- If `prefill.industry` set → read-only badge: "Industry: FinTech"
- If `prefill.model` set → read-only badge: "Model: Train-Hire-Deploy"

#### Institution (additional):
- Institution Name* `[text]`
- Institution Type* `[select]`: Private Engineering College | Government College | Polytechnic | University | Deemed University | Other
- Approx. Student Count `[select]`: <500 | 500–1000 | 1000–3000 | 3000+
- Current Placement Rate `[select]`: <30% | 30–50% | 50–70% | 70%+ | Don't Track
- If `prefill.partnershipModel` set → read-only badge: "Interested in: Co-Branded Finishing School"

#### Individual (additional):
- Current Status* `[select]`: Fresher (0–1 yr) | Working Professional | Career Switcher | Student (Final Year)
- Current Role `[text, optional]`
- Years of Experience `[select]`: 0 | 1–3 | 3–5 | 5–10 | 10+
- Program of Interest `[text]` — pre-filled from `ctx.prefill.program` if present

### Submit button label by intent:
```
schedule_call      → "Book My Session →"
download_brochure  → "Send Me the Brochure →"
get_proposal       → "Request Proposal →"
enquire_program    → "Send Enquiry →"
campus_assessment  → "Schedule Assessment →"
career_counseling  → "Book Counseling →"
free_assessment    → "Start Assessment →"
roi_analysis       → "Get My ROI Report →"
discuss_industry   → "Start the Conversation →"
talk_to_expert     → "Connect Me to an Expert →"
design_program     → "Start Designing My Program →"
start_process      → "Begin Discovery →"
general_contact    → "Send Message →"
```

### Three states:
1. `form` — default, shows fields + submit
2. `success` — animated checkmark, confirmation message, context echo, close button
3. `error` — error message with retry button

### Success state message:
```
✓  You're all set!
   We've received your request and will be in touch within 24 hours.
   [muted] Submitted from: Corporates › Six-Sigma Curation › "Start Discovery Process"
   [Close]
```

---

## STEP 6 — API ROUTES

### `pages/api/submit-lead.ts`

```typescript
import { v4 as uuid } from 'uuid';
import { generateSubjectLine } from '@/lib/generateSubjectLine';
import { sendEmail } from '@/lib/email';
import { db } from '@/lib/db';

// Route email by audience type
const TEAM_EMAILS = {
  corporate:   'corporate@sudaksha.com',
  institution: 'institutions@sudaksha.com',
  individual:  'admissions@sudaksha.com',
  general:     'info@sudaksha.com',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { ctaContext, formData } = req.body;

  const subjectLine = generateSubjectLine(ctaContext);
  const leadId = uuid();
  const createdAt = new Date().toISOString();

  const leadRecord = {
    id: leadId, createdAt, subjectLine,
    ctaContext, formData,
    status: 'new', emailSent: false,
  };

  try {
    // 1. Save lead to DB
    await db.leads.create({ data: leadRecord });

    // 2. Write audit event — form_submitted
    await db.auditEvents.create({ data: {
      id: uuid(), timestamp: createdAt,
      eventType: 'form_submitted', leadId,
      ctaContext, metadata: { subjectLine },
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    }});

    // 3. Send email to correct team inbox
    const toEmail = TEAM_EMAILS[ctaContext.audienceType] || TEAM_EMAILS.general;
    await sendEmail({ to: toEmail, subject: subjectLine, html: buildEmailHTML(leadRecord) });

    // 4. Mark email sent + audit
    await db.leads.update({ where: { id: leadId }, data: { emailSent: true } });
    await db.auditEvents.create({ data: {
      id: uuid(), timestamp: new Date().toISOString(),
      eventType: 'email_sent', leadId,
    }});

    return res.status(200).json({ success: true, leadId });

  } catch (error) {
    await db.auditEvents.create({ data: {
      id: uuid(), timestamp: new Date().toISOString(),
      eventType: 'form_error', metadata: { error: String(error) },
    }});
    return res.status(500).json({ success: false });
  }
}
```

### `pages/api/audit-event.ts`

```typescript
import { v4 as uuid } from 'uuid';
import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { eventType, ctaContext, leadId, metadata } = req.body;
  await db.auditEvents.create({ data: {
    id: uuid(), timestamp: new Date().toISOString(),
    eventType, ctaContext: ctaContext || null,
    leadId: leadId || null, metadata: metadata || {},
    userAgent: req.headers['user-agent'],
    ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  }});
  return res.status(200).json({ success: true });
}
```

---

## STEP 7 — DATABASE SCHEMA (Prisma)

```prisma
model Lead {
  id           String       @id @default(uuid())
  createdAt    DateTime     @default(now())
  subjectLine  String
  ctaContext   Json
  formData     Json
  status       String       @default("new")
  assignedTo   String?
  notes        String?
  emailSent    Boolean      @default(false)
  auditEvents  AuditEvent[]
}

model AuditEvent {
  id          String    @id @default(uuid())
  timestamp   DateTime  @default(now())
  eventType   String
  leadId      String?
  lead        Lead?     @relation(fields: [leadId], references: [id])
  ctaContext  Json?
  metadata    Json?
  userAgent   String?
  ipAddress   String?
}
```

---

## STEP 8 — ADMIN PAGE: `/admin/communication`

### Purpose:
Inbox-style view of every lead/form submission. Full context visible. Team can manage status, assign, add notes.

### Layout:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  SUDAKSHA ADMIN  /  Communication              [Search...]   [Export CSV]    │
├──────────────────────────────────────────────────────────────────────────────┤
│  ALL │ Corporate │ Institution │ Individual │ New │ Contacted │ Converted    │
├──────────────────────────────────────┬───────────────────────────────────────┤
│  LEAD LIST                           │  LEAD DETAIL                          │
│                                      │                                       │
│  ● [Corporate]  Rajesh Kumar         │  Rajesh Kumar                         │
│    Corporates › Six-Sigma › ...      │  rajesh@acme.com  |  +91 98765 43210  │
│    "Start Discovery Process"         │                                       │
│    2 mins ago              [NEW]     │  ── Source Context ──────────────     │
│  ─────────────────────────────────   │  Page:     Corporates                 │
│  ● [Institution]  Priya College      │  Section:  Six-Sigma Curation         │
│    Institutions › Hero › ...         │  CTA:      "Start Discovery Process"  │
│    "Schedule Campus Assessment"      │  Intent:   start_process              │
│    1 hour ago              [NEW]     │  Industry: FinTech                    │
│  ─────────────────────────────────   │                                       │
│  ● [Individual]  Amit Verma          │  ── Lead Details ────────────────     │
│    Individuals › Programs › ...      │  Company:     Acme FinTech Ltd        │
│    "Enquire" — MERN Stack            │  Designation: VP Engineering          │
│    3 hours ago         [CONTACTED]   │  Team Size:   51–200                  │
│                                      │  Need:        Tech Upskilling         │
│                                      │  Message: "We need to migrate..."     │
│                                      │                                       │
│                                      │  ── Manage ──────────────────────     │
│                                      │  Status:    [New ▼]                   │
│                                      │  Assign to: [Select team member ▼]   │
│                                      │  Notes:     [Add internal note...]    │
│                                      │             [Save]                    │
│                                      │                                       │
│                                      │  [📧 Open in Mail]  [🔗 Copy Email]  │
└──────────────────────────────────────┴───────────────────────────────────────┘
```

### Features:
- Audience dot colour: Blue = Corporate, Gold = Institution, Violet = Individual
- Status badges: NEW (blue) | CONTACTED (amber) | IN PROGRESS (purple) | CONVERTED (green) | CLOSED (grey)
- Changing status → writes `admin_status_updated` AuditEvent
- Adding notes → writes `admin_note_added` AuditEvent
- Viewing a lead → writes `admin_viewed` AuditEvent
- Sort: Latest first | Oldest first | By status | By audience
- Search: name, email, company, institution, subject line
- CSV export respects active filters
- Pagination: 20 leads per page

---

## STEP 9 — ADMIN PAGE: `/admin/audit`

### Purpose:
Immutable, chronological log of every system event — modal opens, submissions, email delivery, admin actions, errors. Append-only — no delete capability.

### Layout:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│  SUDAKSHA ADMIN  /  Audit Trail         [Date Range ▼]  [Event Type ▼]      │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌────────────────┐ ┌────────────┐ │
│  │  1,247          │ │  312            │ │  286           │ │  42        │ │
│  │  Modal Opens    │ │  Submissions    │ │  Emails Sent   │ │  Abandoned │ │
│  └─────────────────┘ └─────────────────┘ └────────────────┘ └────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│  Timestamp            Event Type            Lead / Context       Details    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ● 2024-01-15 14:32   form_submitted   [GREEN]   Rajesh Kumar   [Corporate] │
│  ● 2024-01-15 14:32   email_sent       [BLUE]    Rajesh Kumar   → corp@...  │
│  ● 2024-01-15 14:31   modal_opened     [GREY]    (anonymous)    Corporates  │
│  ● 2024-01-15 14:30   modal_abandoned  [AMBER]   (anonymous)    Individuals │
│  ● 2024-01-15 14:28   admin_status_updated [PURPLE] lead#abc    new→contact │
│  ● 2024-01-15 14:25   form_error       [RED]     (anonymous)    500 Error   │
│                                                                              │
│  [Click any row → expand full JSON of ctaContext + metadata]                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Event colour coding:
| Event | Colour |
|-------|--------|
| `form_submitted` | Green |
| `email_sent` | Blue |
| `modal_opened` | Grey/neutral |
| `modal_abandoned` | Amber |
| `form_error` / `email_failed` | Red |
| `admin_*` actions | Purple |

### Features:
- Summary cards: Total opens, submissions, email success rate, abandonment rate
- Filter by event type, date range, audience type
- Expandable rows: click → see full JSON of ctaContext + metadata
- If `leadId` present → links to that lead in `/admin/communication`
- NO delete button — audit trail is append-only by design
- CSV export of filtered events
- Pagination: 50 events per page

---

## STEP 10 — ADMIN AUTH
### `middleware/adminAuth.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin-token')?.value;
    if (token !== process.env.ADMIN_SECRET_TOKEN) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
```

Environment variables required:
```
ADMIN_SECRET_TOKEN=your-secret-here
EMAIL_SMTP_HOST=...
EMAIL_SMTP_USER=...
EMAIL_SMTP_PASS=...
DATABASE_URL=...
```

---

## STEP 11 — `_app.tsx` INTEGRATION

```tsx
import { CTAModalProvider } from '@/context/CTAModalContext';
import { CTAModal } from '@/components/universal/CTAModal';

export default function App({ Component, pageProps }) {
  return (
    <CTAModalProvider>
      <Component {...pageProps} />
      <CTAModal />  {/* Single instance at root — renders anywhere, always available */}
    </CTAModalProvider>
  );
}
```

---

## STEP 12 — FULL CTA CONTEXT MAP (all pages)

### `/corporates` — 13 CTAs:
```typescript
{ page:'Corporates', section:'Hero', ctaLabel:'Schedule Strategy Session', audienceType:'corporate', intent:'schedule_call' }
{ page:'Corporates', section:'Hero', ctaLabel:'Download Corporate Brochure', audienceType:'corporate', intent:'download_brochure' }
{ page:'Corporates', section:'Sudaksha Approach', ctaLabel:'Schedule Discovery Call', audienceType:'corporate', intent:'schedule_call' }
{ page:'Corporates', section:'Training Models', ctaLabel:'Design Your Program', audienceType:'corporate', intent:'design_program' }
{ page:'Corporates', section:'Industry Training Solutions', ctaLabel:'Design Your [INDUSTRY] Training Program', audienceType:'corporate', intent:'design_program', prefill:{ industry:'[INDUSTRY]' } }
{ page:'Corporates', section:'Industry Training Solutions', ctaLabel:'Discuss Your Industry', audienceType:'corporate', intent:'discuss_industry' }
{ page:'Corporates', section:'Proven Impact', ctaLabel:'Schedule Consultation', audienceType:'corporate', intent:'schedule_call' }
{ page:'Corporates', section:'Six-Sigma Curation Process', ctaLabel:'Start Discovery Process', audienceType:'corporate', intent:'start_process' }
{ page:'Corporates', section:'Flexible Delivery Models', ctaLabel:'Get Delivery Recommendation', audienceType:'corporate', intent:'schedule_call' }
{ page:'Corporates', section:'ROI Calculator', ctaLabel:'Get Detailed ROI Analysis', audienceType:'corporate', intent:'roi_analysis' }
{ page:'Corporates', section:'FAQ', ctaLabel:'Talk to an Expert', audienceType:'corporate', intent:'talk_to_expert' }
{ page:'Corporates', section:'Ready to Transform', ctaLabel:'Book Your Session', audienceType:'corporate', intent:'schedule_call' }
{ page:'Corporates', section:'Ready to Transform', ctaLabel:'Request Proposal', audienceType:'corporate', intent:'get_proposal' }
```

### `/institutions` — 11 CTAs:
```typescript
{ page:'Institutions', section:'Hero', ctaLabel:'Schedule Campus Assessment', audienceType:'institution', intent:'campus_assessment' }
{ page:'Institutions', section:'Hero', ctaLabel:'Download Partnership Brochure', audienceType:'institution', intent:'download_brochure' }
{ page:'Institutions', section:'Finishing School', ctaLabel:'Explore Finishing School', audienceType:'institution', intent:'enquire_program', prefill:{ partnershipModel:'Finishing School' } }
{ page:'Institutions', section:'Curriculum Mapping', ctaLabel:'Request Curriculum Audit', audienceType:'institution', intent:'campus_assessment', prefill:{ partnershipModel:'Curriculum Audit' } }
{ page:'Institutions', section:'PP Index', ctaLabel:'Implement PP Index', audienceType:'institution', intent:'design_program', prefill:{ partnershipModel:'PP Index' } }
{ page:'Institutions', section:'Faculty Development', ctaLabel:'Request Faculty Development', audienceType:'institution', intent:'design_program', prefill:{ partnershipModel:'Faculty Development' } }
{ page:'Institutions', section:'Lab Infrastructure', ctaLabel:'Modernize Labs', audienceType:'institution', intent:'design_program', prefill:{ partnershipModel:'Lab Infrastructure' } }
{ page:'Institutions', section:'Corporate Pipeline', ctaLabel:'Access Corporate Network', audienceType:'institution', intent:'discuss_industry' }
{ page:'Institutions', section:'Partnership Models', ctaLabel:'Learn More — [MODEL]', audienceType:'institution', intent:'get_proposal', prefill:{ partnershipModel:'[MODEL]' } }
{ page:'Institutions', section:'Footer CTA', ctaLabel:'Schedule Free Assessment', audienceType:'institution', intent:'campus_assessment' }
{ page:'Institutions', section:'Footer CTA', ctaLabel:'Request Custom Proposal', audienceType:'institution', intent:'get_proposal' }
```

### `/individuals` — 10 CTAs:
```typescript
{ page:'Individuals', section:'Hero', ctaLabel:'Explore Programs', audienceType:'individual', intent:'enquire_program' }
{ page:'Individuals', section:'Hero', ctaLabel:'Talk to Counselor', audienceType:'individual', intent:'career_counseling' }
{ page:'Individuals', section:'Choose Your Path', ctaLabel:'Talk to Career Counselor', audienceType:'individual', intent:'career_counseling' }
// Each program card (loop all 9 programs):
{ page:'Individuals', section:'Career-Launch Programs', ctaLabel:'Enquire', audienceType:'individual', intent:'enquire_program', prefill:{ program:'Java Full Stack Plus (320 Hours)' } }
{ page:'Individuals', section:'Career-Launch Programs', ctaLabel:'Enquire', audienceType:'individual', intent:'enquire_program', prefill:{ program:'MERN Stack (300 Hours)' } }
// ... all 9 programs
{ page:'Individuals', section:'Program Comparison', ctaLabel:'Schedule Career Counseling', audienceType:'individual', intent:'career_counseling' }
{ page:'Individuals', section:'Working Professionals', ctaLabel:'Schedule Leadership Consultation', audienceType:'individual', intent:'career_counseling' }
{ page:'Individuals', section:'Career Switchers', ctaLabel:'Take Free Assessment', audienceType:'individual', intent:'free_assessment' }
{ page:'Individuals', section:'Career Switchers', ctaLabel:'Book Free Counseling', audienceType:'individual', intent:'career_counseling' }
{ page:'Individuals', section:'Career Switchers', ctaLabel:'Start Your Career Switch', audienceType:'individual', intent:'free_assessment' }
```

---

## WHAT GETS RECORDED — SUMMARY TABLE

| Event | Communication page | Audit page | Email sent |
|-------|-------------------|------------|------------|
| CTA button clicked | — | modal_opened ✓ | — |
| Modal closed without submitting | — | modal_abandoned ✓ | — |
| Form submitted | New lead record ✓ | form_submitted ✓ | To team ✓ |
| Email sent to team | emailSent: true ✓ | email_sent ✓ | — |
| Email failed | emailSent: false ✓ | email_failed ✓ | — |
| API error | — | form_error ✓ | — |
| Admin views lead | — | admin_viewed ✓ | — |
| Admin changes status | Status updated ✓ | admin_status_updated ✓ | — |
| Admin adds note | Notes updated ✓ | admin_note_added ✓ | — |
