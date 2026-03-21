# SUDAKSHA.COM — MASTER CODING AGENT PROMPT
## Complete Website Remediation, CTA Wiring & Content Generation

**Version:** 1.0  
**Prepared by:** Claude (Anthropic) for Sudaksha Engineering Team  
**Target Stack:** React.js / TypeScript + Node.js/NestJS + PostgreSQL + AWS  
**Audit Date:** March 21, 2026

---

## AGENT INSTRUCTIONS — READ FIRST

You are an expert full-stack developer tasked with a complete remediation of sudaksha.com. Work through each section sequentially. Every CTA action across the entire website must POST a lead/interaction record to the `/admin/communication` module. Do not skip any item. After completing each section, run a smoke test and confirm the fix before proceeding.

**Global Rule for ALL CTAs:**
Every button, link, form, and interactive element that captures user intent must:
1. Send a POST to `POST /api/admin/communication/capture` with the payload structure defined in Section 1.
2. Show a success toast/modal to the user confirming their action was received.
3. Never silently fail — always show a fallback error state with the contact phone number.

---

## SECTION 1 — ADMIN COMMUNICATION MODULE (Build This First)

Before fixing any page, build the central lead/communication capture system.

### 1.1 Database Schema

```sql
-- Create the communication_log table
CREATE TABLE communication_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source tracking
  source_page VARCHAR(255) NOT NULL,        -- e.g. '/for-individuals'
  cta_label VARCHAR(255) NOT NULL,          -- e.g. 'Book Free Demo'
  cta_type VARCHAR(100) NOT NULL,           -- 'form_submit' | 'button_click' | 'link_click' | 'download' | 'video_play'
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  referrer_url TEXT,

  -- User identity (all optional until form fill)
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(100),

  -- Intent classification
  user_type VARCHAR(50),                    -- 'individual' | 'corporate' | 'institution' | 'unknown'
  intent VARCHAR(100),                      -- 'demo_class' | 'counseling' | 'brochure' | 'enrollment' | 'corporate_quote' | 'partnership' | 'general_inquiry'
  program_interest VARCHAR(255),            -- e.g. 'Java Full Stack Plus'
  message TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'new',         -- 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
  assigned_to VARCHAR(255),
  follow_up_date DATE,
  notes TEXT,

  -- Metadata
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  ip_address INET
);

CREATE INDEX idx_communication_log_status ON communication_log(status);
CREATE INDEX idx_communication_log_created_at ON communication_log(created_at DESC);
CREATE INDEX idx_communication_log_user_type ON communication_log(user_type);
CREATE INDEX idx_communication_log_intent ON communication_log(intent);
CREATE INDEX idx_communication_log_email ON communication_log(email);
```

### 1.2 API Endpoints (NestJS)

Build the following REST endpoints in `src/modules/admin/communication/`:

```
POST   /api/admin/communication/capture          → Create new lead/interaction log
GET    /api/admin/communication                   → List all (paginated, filterable)
GET    /api/admin/communication/:id               → Get single record
PATCH  /api/admin/communication/:id/status        → Update status + notes
GET    /api/admin/communication/stats/summary     → Dashboard summary stats
GET    /api/admin/communication/export/csv        → CSV export (date range)
POST   /api/admin/communication/bulk-assign       → Assign multiple leads to counselor
```

**Capture Payload Schema (TypeScript):**

```typescript
interface CommunicationCaptureDto {
  // Required
  sourcePage: string;
  ctaLabel: string;
  ctaType: 'form_submit' | 'button_click' | 'link_click' | 'download' | 'video_play';

  // User identity (send whatever is available)
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;

  // Intent
  userType?: 'individual' | 'corporate' | 'institution' | 'unknown';
  intent?: string;
  programInterest?: string;
  message?: string;

  // Auto-captured
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerUrl?: string;
  sessionId?: string;
}
```

**Auto-trigger side effects on capture:**
- Send email notification to `crm@sudaksha.com` for any intent = 'enrollment' or 'corporate_quote'
- Send WhatsApp message via configured provider to the lead's phone if phone is provided
- Add to appropriate email nurture sequence based on `userType`

### 1.3 Admin Dashboard Page `/admin/communication`

Build a full admin UI at this route (protected, role-based auth):

**Dashboard Features:**
- Summary cards: Total leads today / this week / this month, Conversion rate, Leads by source page
- Leads table: Sortable by date, status, intent, user_type. Searchable by name/email/phone.
- Status pipeline: Kanban view — New → Contacted → Qualified → Converted
- Filter bar: Date range, user_type, intent, assigned_to, source_page
- Row actions: View details, Update status, Add notes, Assign counselor, Mark follow-up date
- Bulk actions: Export CSV, Bulk assign, Bulk status update
- Real-time: Poll for new leads every 60 seconds, show badge count

**Columns in leads table:**
Date/Time | Name | Phone | Email | Source Page | CTA Label | Intent | Program Interest | Status | Assigned To | Actions

### 1.4 Reusable Frontend Hook

Create a React hook `useCTACapture()` that all pages will use:

```typescript
// src/hooks/useCTACapture.ts
export const useCTACapture = () => {
  const capture = async (data: CommunicationCaptureDto) => {
    try {
      await fetch('/api/admin/communication/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          referrerUrl: document.referrer,
          sessionId: getSessionId(), // from localStorage or cookie
          utmSource: getUTMParam('utm_source'),
          utmMedium: getUTMParam('utm_medium'),
          utmCampaign: getUTMParam('utm_campaign'),
        }),
      });
    } catch (e) {
      // Fail silently — never block UX
      console.error('CTA capture failed:', e);
    }
  };
  return { capture };
};
```

---

## SECTION 2 — CRITICAL BUG FIXES

### 2.1 Fix `/courses` — Dynamic Data Not Loading

**Problem:** Page shows "0 Courses Found" and "Loading courses..."  
**Root cause:** Diagnose and fix the API call in the courses page component.

Steps:
1. Open `src/pages/courses/index.tsx` (or equivalent)
2. Find the `useEffect` or data-fetching call for courses
3. Check the API endpoint — verify it matches the backend route and is not a localhost URL
4. Check CORS headers on the backend course endpoint
5. Add proper error state: if fetch fails, show a hardcoded fallback grid of 6 featured courses
6. Add loading skeleton cards (not just text)
7. Ensure filters (Technology / Domain / Behaviour / Cognitive tabs) work once data loads

**Fallback courses to hardcode if API fails (render these statically):**
```
1. Java Full Stack Plus — 320 hrs — ₹45,000 — Fresher/Working Pro — Live Online + Offline
2. Python Full Stack — 280 hrs — ₹42,000 — Fresher/Working Pro — Live Online
3. Data Science & Analytics — 360 hrs — ₹55,000 — All levels — Live Online + Offline
4. MERN Stack Development — 300 hrs — ₹45,000 — Fresher/Working Pro — Live Online
5. DevOps & Cloud Engineering — 240 hrs — ₹50,000 — Working Pro — Live Online
6. QA Automation Testing — 200 hrs — ₹38,000 — Working Pro — Live Online + Offline
```

Each course card CTA ("Enroll Now" / "Know More") must call `capture()` with:
```json
{ "ctaLabel": "Enroll Now - Java Full Stack Plus", "ctaType": "button_click", "sourcePage": "/courses", "intent": "enrollment", "programInterest": "Java Full Stack Plus" }
```

### 2.2 Fix `/blog` — Posts Not Loading

**Problem:** "Loading blogs..." shows indefinitely  
**Steps:**
1. Find blog data fetch — check API endpoint and response format
2. Fix or seed 6 blog posts in the database (content below in Section 6)
3. Add error state with a "Check back soon" message if API fails
4. Wire "Read More" links to `/blog/[slug]` dynamic routes

### 2.3 Fix `/webinars` — Webinars Not Loading

**Problem:** "Loading webinars..." shows indefinitely  
**Steps:**
1. Fix fetch, or seed webinar records (content in Section 6)
2. Update all dates to 2026 — remove Feb 2025 references everywhere
3. "Register Now" buttons must open a modal with a registration form that calls `capture()` with `intent: 'webinar_registration'`

### 2.4 Fix WhatsApp & Phone Links on `/contact`

**Problem:** Double `91` prefix on WhatsApp and tel links  

Find and replace globally across all files:
```
WRONG:  href="https://wa.me/9191241044435"
CORRECT: href="https://wa.me/919121044435"

WRONG:  href="tel:+9191241044435"
CORRECT: href="tel:+919121044435"
```

Also verify the second phone number (`+91 80468 62777`) appears on the homepage footer — confirm this is intentional or consolidate to one number.

### 2.5 Fix Footer Copyright Year

Find and replace in footer component:
```
WRONG:  © 2024 Sudaksha
CORRECT: © 2026 Sudaksha
```

---

## SECTION 3 — COMPLETE CTA WIRING MAP

Wire every CTA below. Each entry shows: Page → CTA Label → Action → capture() payload.

### 3.1 Homepage (`/`)

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Explore Programs | `/courses` | `{ctaLabel:'Explore Programs', intent:'browse_courses', sourcePage:'/'}` |
| Book Free Consultation | Open lead modal | `{ctaLabel:'Book Free Consultation', intent:'counseling', sourcePage:'/'}` |
| Explore Corporate Solutions | `/for-corporates` | `{ctaLabel:'Explore Corporate Solutions', userType:'corporate', sourcePage:'/'}` |
| Start Your Journey | `/for-individuals` | `{ctaLabel:'Start Your Journey', userType:'individual', sourcePage:'/'}` |
| Partner With Us | `/for-institutions` | `{ctaLabel:'Partner With Us', userType:'institution', sourcePage:'/'}` |
| Browse All Courses | `/courses` | `{ctaLabel:'Browse All Courses', intent:'browse_courses', sourcePage:'/'}` |
| Explore Programs for Individuals | `/for-individuals` | `{ctaLabel:'Explore Programs for Individuals', userType:'individual', sourcePage:'/'}` |
| Get Corporate Training Quote | Open quote modal | `{ctaLabel:'Get Corporate Training Quote', intent:'corporate_quote', userType:'corporate', sourcePage:'/'}` |

**"Book Free Consultation" Modal** — build a slide-in drawer with fields:
- Name*, Phone*, Email*, I am a (Fresher / Working Pro / Corporate HR / Institution), Program Interest (dropdown)
- On submit: `capture()` + show "We'll call you within 2 hours" confirmation

### 3.2 `/for-individuals`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Find Your Program (×2) | `/courses` | `{ctaLabel:'Find Your Program', userType:'individual', intent:'browse_courses', sourcePage:'/for-individuals'}` |
| Talk to Career Counselor (×2) | Open counselor modal | `{ctaLabel:'Talk to Career Counselor', intent:'counseling', userType:'individual', sourcePage:'/for-individuals'}` |
| Explore Finishing School | `/courses?filter=finishing-school` | `{ctaLabel:'Explore Finishing School', programInterest:'Finishing School', sourcePage:'/for-individuals'}` |
| Find Your Track | `/courses?filter=working-professional` | `{ctaLabel:'Find Your Track', programInterest:'Working Professional', sourcePage:'/for-individuals'}` |
| Start Career Switch Journey | `/courses?filter=career-switch` | `{ctaLabel:'Start Career Switch Journey', programInterest:'Career Switch', sourcePage:'/for-individuals'}` |
| Watch Full Video — Priya Sharma | Open video modal (embed YouTube/Vimeo placeholder) | `{ctaLabel:'Watch Story - Priya Sharma', ctaType:'video_play', sourcePage:'/for-individuals'}` |
| Watch Full Video — Rajesh Kumar | Open video modal | `{ctaLabel:'Watch Story - Rajesh Kumar', ctaType:'video_play', sourcePage:'/for-individuals'}` |
| Watch Full Video — Meera Desai | Open video modal | `{ctaLabel:'Watch Story - Meera Desai', ctaType:'video_play', sourcePage:'/for-individuals'}` |

**Video Modal:** Until real videos exist, show a modal with a poster image, the student's story text, and a "Get in Touch" CTA that opens the counselor form.

**Counselor Modal fields:** Name*, Phone*, Email*, Current Situation (dropdown: Fresh Graduate / Working Professional / Career Switcher / Other), Best time to call (Morning / Afternoon / Evening)

### 3.3 `/for-corporates`

This page needs significant content expansion AND CTA wiring:

**Build these new sections:**
1. Hero with stats (same structure as /consult)
2. Engagement Models: Train-Hire-Deploy | Deploy-Train-Hire | Custom L&D
3. Industries served: IT/SaaS, BFSI, Manufacturing, Pharma, Defense
4. Process: Needs Analysis → Curriculum Design → Delivery → Assessment → Report
5. Client logos strip (placeholder boxes labeled with industry)
6. "Request a Quote" form

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Get Started | Open quote form modal | `{ctaLabel:'Get Started - Corporate', intent:'corporate_quote', userType:'corporate', sourcePage:'/for-corporates'}` |
| Explore Programs | `/for-corporates/domestic` → fallback to `/courses` | `{ctaLabel:'Explore Corporate Programs', userType:'corporate', sourcePage:'/for-corporates'}` |
| Schedule a Consultation | Open booking modal | `{ctaLabel:'Schedule Consultation', intent:'counseling', userType:'corporate', sourcePage:'/for-corporates'}` |
| Download Corporate Brochure | Trigger PDF download (see Section 5) + capture | `{ctaLabel:'Download Corporate Brochure', ctaType:'download', intent:'brochure', userType:'corporate', sourcePage:'/for-corporates'}` |

### 3.4 `/for-institutions`

Expand this page with:
1. Partnership models in detail (Training Partner, Skill Dev Centre, Curriculum Mapping)
2. Placement Probability (PP) Index explanation with sample dashboard screenshot
3. Process timeline: Assessment → MoU → Setup → Training → Placement → Report
4. Testimonial from a college principal
5. "Start Partnership Discussion" form

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Partner With Us | Open partnership form modal | `{ctaLabel:'Partner With Us', intent:'partnership', userType:'institution', sourcePage:'/for-institutions'}` |
| View Programs | `/courses` | `{ctaLabel:'View Programs - Institutions', userType:'institution', sourcePage:'/for-institutions'}` |
| Start Partnership Discussion | Open partnership form modal | `{ctaLabel:'Start Partnership Discussion', intent:'partnership', userType:'institution', sourcePage:'/for-institutions'}` |
| Download Institution Brochure | Trigger PDF download | `{ctaLabel:'Download Institution Brochure', ctaType:'download', intent:'brochure', userType:'institution', sourcePage:'/for-institutions'}` |

### 3.5 `/why-sudaksha`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Experience a Demo Class (`#demo`) | Scroll to demo section OR open demo modal | `{ctaLabel:'Experience Demo Class', intent:'demo_class', sourcePage:'/why-sudaksha'}` |
| Talk to Our Alumni | Open alumni connect modal | `{ctaLabel:'Talk to Alumni', intent:'alumni_connect', sourcePage:'/why-sudaksha'}` |
| Book Free Demo | Open demo booking modal | `{ctaLabel:'Book Free Demo', intent:'demo_class', sourcePage:'/why-sudaksha'}` |
| Connect with Students (`#students`) | Open student connect form | `{ctaLabel:'Connect with Students', intent:'student_connect', sourcePage:'/why-sudaksha'}` |
| Talk to Alumni (`#alumni`) | Open alumni connect form | `{ctaLabel:'Talk to Alumni - Form', intent:'alumni_connect', sourcePage:'/why-sudaksha'}` |
| View Placement Report 2023 | Trigger PDF download (Section 5) | `{ctaLabel:'View Placement Report 2023', ctaType:'download', intent:'brochure', sourcePage:'/why-sudaksha'}` |
| Watch video (×6 testimonials) | Open video modal with story | `{ctaLabel:'Watch Story - [name]', ctaType:'video_play', sourcePage:'/why-sudaksha'}` |
| Explore Programs | `/courses` | `{ctaLabel:'Explore Programs', sourcePage:'/why-sudaksha'}` |
| Talk to Counselor | Open counselor modal | `{ctaLabel:'Talk to Counselor', intent:'counseling', sourcePage:'/why-sudaksha'}` |
| Book Demo Class | Open demo modal | `{ctaLabel:'Book Demo Class - Bottom', intent:'demo_class', sourcePage:'/why-sudaksha'}` |

**Demo Booking Modal fields:** Name*, Phone*, Email*, Preferred Date (date picker), Preferred Time (10 AM / 3 PM), Mode (Online / Offline)

**Alumni/Student Connect Modal:** Name*, Phone*, Email*, Your question for the alumna/student (textarea)

### 3.6 `/consult`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Get My Free Diagnostic | Scroll to diagnostic form | `{ctaLabel:'Get My Free Diagnostic', intent:'diagnostic', userType:'corporate', sourcePage:'/consult'}` |
| Watch Case Study | Open video modal (placeholder) | `{ctaLabel:'Watch Case Study', ctaType:'video_play', sourcePage:'/consult'}` |
| Get Started — Starter (₹75k) | Open pricing inquiry form | `{ctaLabel:'Get Started - Starter Plan', intent:'corporate_quote', sourcePage:'/consult', programInterest:'Starter ₹75k'}` |
| Get Started — Accelerator (₹2.5L) | Open pricing inquiry form | `{ctaLabel:'Get Started - Accelerator Plan', intent:'corporate_quote', sourcePage:'/consult', programInterest:'Accelerator ₹2.5L'}` |
| Get Started — Enterprise | Open pricing inquiry form | `{ctaLabel:'Get Started - Enterprise Plan', intent:'corporate_quote', sourcePage:'/consult', programInterest:'Enterprise Custom'}` |
| Download Diagnostic Report (form) | On form submit → generate/download PDF + capture | `{ctaLabel:'Download Diagnostic Report', ctaType:'form_submit', intent:'diagnostic', sourcePage:'/consult', ...formData}` |
| EXPLORE SOLUTIONS (×4 verticals) | `/for-corporates#[vertical]` | `{ctaLabel:'Explore [vertical] Solutions', userType:'corporate', sourcePage:'/consult'}` |

**Pricing Inquiry Modal fields:** Name*, Company Name*, Phone*, Email*, Team Size (dropdown), Message

**Diagnostic Form:** Make the existing form fully functional — on submit, POST to capture + trigger a PDF download of the "Workforce Diagnostic Report" (Section 5.3).

### 3.7 `/resources`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Explore Roadmaps → | `/resources#roadmaps` — build anchor section | `{ctaLabel:'Explore Roadmaps', sourcePage:'/resources'}` |
| Take Test → | `/resources#assessment` — build inline assessment | `{ctaLabel:'Take Skill Test', intent:'assessment', sourcePage:'/resources'}` |
| View Salaries → | `/resources#salary` — build anchor section | `{ctaLabel:'View Salary Guide', sourcePage:'/resources'}` |
| Start Preparing → | `/resources#interview` — build anchor section | `{ctaLabel:'Start Interview Prep', sourcePage:'/resources'}` |
| All career roadmap links | `/resources/roadmap/[slug]` pages | `{ctaLabel:'Roadmap - [name]', ctaType:'link_click', sourcePage:'/resources'}` |
| Take Assessment | Open inline assessment widget | `{ctaLabel:'Take Assessment', intent:'assessment', sourcePage:'/resources'}` |
| Download Full Report (salary) | Trigger PDF download | `{ctaLabel:'Download Salary Report', ctaType:'download', sourcePage:'/resources'}` |
| Calculate ROI → | Open ROI calculator modal | `{ctaLabel:'Calculate ROI', sourcePage:'/resources'}` |
| Calculate EMI → | Open EMI calculator modal | `{ctaLabel:'Calculate EMI', sourcePage:'/resources'}` |
| Login to Portal | `/portal/login` | `{ctaLabel:'Login to Student Portal', ctaType:'link_click', sourcePage:'/resources'}` |
| Register Now (webinar ×2) | Open webinar registration modal | `{ctaLabel:'Register Webinar - [title]', intent:'webinar_registration', sourcePage:'/resources'}` |
| Start Chat | Open WhatsApp link (`wa.me/919121044435`) | `{ctaLabel:'Start WhatsApp Chat', ctaType:'link_click', sourcePage:'/resources'}` |
| Schedule Call | Open counselor booking modal | `{ctaLabel:'Schedule Call - Resources', intent:'counseling', sourcePage:'/resources'}` |
| Email Me (brochure) | Open email brochure form | `{ctaLabel:'Get Brochure Email', ctaType:'form_submit', intent:'brochure', sourcePage:'/resources'}` |
| Read More → (blog ×3) | `/blog/[slug]` | `{ctaLabel:'Read Blog - [title]', ctaType:'link_click', sourcePage:'/resources'}` |

**Build these interactive tools (inline on the page):**
- **ROI Calculator:** Input: Current Salary (slider ₹2L-₹20L), Program Fee (₹40k-₹60k). Output: Monthly EMI, Payback months, 5-year total gain. Fully functional JS.
- **EMI Calculator:** Input: Loan amount, tenure in months (6/12/18/24). Output: Monthly payment, total amount, interest amount.

### 3.8 `/contact`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Send Message (form submit) | POST to capture + show confirmation | `{ctaLabel:'Send Message', ctaType:'form_submit', intent:'general_inquiry', sourcePage:'/contact', name, email, message}` |
| Chat with Us (WhatsApp) | `wa.me/919121044435` | `{ctaLabel:'WhatsApp Chat', ctaType:'link_click', sourcePage:'/contact'}` |
| Book a Call | `tel:+919121044435` | `{ctaLabel:'Book a Call - Contact', ctaType:'link_click', sourcePage:'/contact'}` |
| Visit Us (anchor) | Scroll to map section | No capture needed |
| Get Directions | Google Maps link | `{ctaLabel:'Get Directions', ctaType:'link_click', sourcePage:'/contact'}` |

**Contact Form:** Currently has no submit handler. Wire it to POST to `/api/admin/communication/capture` with the form fields. Show success: "Thank you [Name]! We'll get back to you within 2 business hours."

### 3.9 `/about`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Talk to Us | `/contact` | `{ctaLabel:'Talk to Us - About', sourcePage:'/about'}` |
| Explore Programmes | `/courses` | `{ctaLabel:'Explore Programmes - About', sourcePage:'/about'}` |
| Freshers — Learn more | `/for-individuals` | `{ctaLabel:'Learn More - Freshers', sourcePage:'/about'}` |
| Corporates — Learn more | `/for-corporates` | `{ctaLabel:'Learn More - Corporates', userType:'corporate', sourcePage:'/about'}` |
| Institutions — Learn more | `/for-institutions` | `{ctaLabel:'Learn More - Institutions', userType:'institution', sourcePage:'/about'}` |
| Browse Courses | `/courses` | `{ctaLabel:'Browse Courses - About Bottom', sourcePage:'/about'}` |
| Contact Us | `/contact` | `{ctaLabel:'Contact Us - About Bottom', sourcePage:'/about'}` |

### 3.10 `/faq`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Contact Us (bottom) | `/contact` | `{ctaLabel:'Contact Us - FAQ', sourcePage:'/faq'}` |

**Fix FAQ content:**
- Remove all references to "Africa, MENA, and other emerging markets" — replace with "India, with select international programs"
- Update "Where is Sudaksha located?" to list Hyderabad HQ + mention online delivery across India
- Fix all collapsed FAQ answers to have actual content (they currently show blank on expand)

### 3.11 `/skill-assessment`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Learn More | Open assessment inquiry modal | `{ctaLabel:'Learn More - Skill Assessment', userType:'corporate', intent:'assessment', sourcePage:'/skill-assessment'}` |
| Contact Us | `/contact` | `{ctaLabel:'Contact Us - Skill Assessment', sourcePage:'/skill-assessment'}` |
| Request a Skill Assessment | Open assessment request form | `{ctaLabel:'Request Skill Assessment', intent:'assessment', userType:'corporate', sourcePage:'/skill-assessment'}` |

### 3.12 `/corporate-training`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Request Consultation | Open consultation form modal | `{ctaLabel:'Request Consultation - Corporate Training', intent:'corporate_quote', userType:'corporate', sourcePage:'/corporate-training'}` |
| Schedule Consultation | Open consultation form modal | `{ctaLabel:'Schedule Consultation - Corporate Training', intent:'corporate_quote', userType:'corporate', sourcePage:'/corporate-training'}` |

### 3.13 `/success-stories`

| CTA Label | Target | Capture Payload |
|-----------|--------|-----------------|
| Explore Courses | `/courses` | `{ctaLabel:'Explore Courses - Success Stories', sourcePage:'/success-stories'}` |

**Fix content issues:**
- Replace Lagos/Dubai/Nairobi placeholder alumni with Indian profiles
- Use the profiles from /for-individuals (Priya Sharma, Rajesh Kumar, Meera Desai, Vikram Mehta)
- Add a "Share Your Story" CTA for alumni to submit their own story

---

## SECTION 4 — GLOBAL ENHANCEMENTS

### 4.1 Floating WhatsApp Button (All Pages)

Add a fixed-position WhatsApp chat button on every page (bottom-right corner):
```
Icon: WhatsApp SVG
Link: https://wa.me/919121044435?text=Hi%20Sudaksha%2C%20I%20want%20to%20know%20more%20about%20your%20programs
Position: fixed, bottom: 24px, right: 24px, z-index: 9999
Capture: {ctaLabel: 'WhatsApp Float Button', ctaType: 'link_click', sourcePage: currentPath}
```

### 4.2 Exit-Intent Popup (Homepage & /courses only)

When user's mouse moves toward browser top (exit intent), show a modal:
- Headline: "Wait — get our free program guide before you leave"
- Fields: Name, Email, I'm interested in (dropdown)
- CTA: "Send Me the Guide"
- Capture: `{ctaLabel: 'Exit Intent Popup', ctaType: 'form_submit', intent: 'brochure', sourcePage: currentPath}`
- Suppress after shown once per session (localStorage)

### 4.3 Sticky Header CTA

Add a sticky "Book Free Consultation" button to the navigation bar (desktop only, right side):
- On scroll past hero section: button appears with slide-down animation
- Opens the standard counselor modal
- Capture: `{ctaLabel: 'Sticky Nav CTA', intent: 'counseling', sourcePage: currentPath}`

### 4.4 Fix Statistics Inconsistency

**Canonical numbers to use everywhere (pick ONE and enforce globally):**

```
Students Trained / Placed: 50,000+         ← use this (from /about, strongest number)
Working Professionals Trained: 30,000+
Placement Rate: 85%+
Average Starting Salary: ₹6.5 LPA
Corporate Partners: 200+
Expert Trainers: 3,400+
Industries Served: 12
Years of Excellence: 18+
Countries: 10+
```

Run a global search-replace across all page files for outdated stat values.

### 4.5 Chatbot Widget

Implement a simple rule-based chatbot in the bottom-left corner:

**Opening message:** "Hi 👋 I'm Sudha, Sudaksha's assistant. Are you a student, working professional, or from a company?"

**Decision tree:**
- Student → "What are you looking for? [Get Placed] [Upskill] [Explore Courses]"
- Working Pro → "What's your goal? [Switch Career] [Get Promoted] [Learn New Tech]"
- Company → "What do you need? [Train My Team] [Hire Trained Talent] [Assessment Services]"
- Each terminal node → open the relevant modal + capture lead

All chatbot interactions: `{ctaLabel: 'Chatbot - [step]', ctaType: 'button_click', intent: derived_intent, sourcePage: currentPath}`

### 4.6 Google Analytics 4 + Meta Pixel

Ensure these are firing on:
- All page views
- All form submissions
- All CTA clicks (send as custom events to GA4)
- Purchase events for enrollments

### 4.7 SEO Fixes

- Update all `<title>` tags — currently many pages share the same title "Sudaksha - Bridging Academic Output & Industry Demand"
- Add unique meta descriptions per page (150-160 chars)
- Add Open Graph tags for social sharing
- Fix canonical URLs
- Add structured data (Organization, Course, FAQPage schemas)

---

## SECTION 5 — PDF & CONTENT ASSETS TO GENERATE

Generate these PDF documents and host them at the given paths. Use a PDF generation library (Puppeteer or PDFKit) to build them programmatically.

### 5.1 Corporate Training Brochure
**Path:** `/public/downloads/sudaksha-corporate-training-brochure.pdf`  
**Trigger:** "Download Corporate Brochure" CTAs  
**Content to include:**
- Cover: Sudaksha Corporate Training Solutions | Transforming Workforce DNA
- Page 2: The Talent Crisis (stats: ₹4.2Cr lost productivity, 68% skill mismatch, 3.5x hiring cost)
- Page 3: Our Engagement Models — Train-Hire-Deploy | Deploy-Train-Hire | Custom L&D
- Page 4: Industry Specializations (Defense, IT/SaaS, Manufacturing, Pharma, BFSI)
- Page 5: The 4-Step Transformation Engine (Diagnostic → Design → Implement → Measure)
- Page 6: Pricing Overview (Starter ₹75k / Accelerator ₹2.5L / Enterprise Custom)
- Page 7: Success Metrics — 42% productivity delta, 94% retention, 8.5/10 skill gap closure
- Page 8: Contact — corporate@sudaksha.com | +91 91210 44435 | Jubilee Hills, Hyderabad
- Design: Dark professional theme (navy/charcoal), Sudaksha branding

### 5.2 Individual Programs Brochure
**Path:** `/public/downloads/sudaksha-programs-brochure.pdf`  
**Trigger:** "Get Brochure" CTAs  
**Content:**
- Cover: Your Career Transformation Starts Here
- Page 2: 3 Journeys — Fresh Graduate | Working Professional | Career Switcher
- Page 3-4: Program catalog (6 programs with duration, fee, outcomes)
- Page 5: Fee structure + payment options (Standard EMI / Pay After Placement / ISA / Scholarships)
- Page 6: Placement stats + top hiring companies
- Page 7: Success stories (Priya, Rajesh, Meera, Vikram with photos)
- Page 8: Contact + enroll CTA

### 5.3 Workforce Diagnostic Report (Dynamic)
**Path:** Generated on-demand per submission  
**Trigger:** Diagnostic form on `/consult`  
**Content (dynamic fields in brackets):**
- Cover: Workforce Diagnostic Report | Prepared for [Company/Industry] | [Date]
- Section 1: Industry Benchmark — average skill gap in [selected industry]
- Section 2: What this means for your organization (2-3 paragraphs based on team size)
- Section 3: Recommended Engagement Model based on inputs
- Section 4: Estimated ROI calculation
- Section 5: Next Steps + CTA to schedule a detailed consultation
- Footer: sudaksha.com | corporate@sudaksha.com

### 5.4 Placement Report 2025
**Path:** `/public/downloads/sudaksha-placement-report-2025.pdf`  
**Trigger:** "View Placement Report" CTA on /why-sudaksha  
**Content:**
- Cover: Sudaksha Placement Report 2025
- Summary: 85% placement rate, 10,000+ placed, ₹6.5 LPA average
- Placement by program (table)
- Salary distribution chart (ranges)
- Top 20 hiring companies (list)
- Timeline data: avg 2.8 months to placement
- Student satisfaction: 4.8/5 from 3,500 reviews
- Methodology note

### 5.5 IT Salary Guide 2025
**Path:** `/public/downloads/sudaksha-salary-guide-2025.pdf`  
**Trigger:** "Download Full Report" on /resources  
**Content:**
- Cover: India IT Salary Guide 2025 | Sudaksha Research
- Salary by role (Full Stack, Data Science, DevOps, QA, etc.)
- Salary by experience band (0-2y, 3-5y, 5-10y, 10y+)
- Salary by city (Bangalore, Hyderabad, Pune, NCR, Chennai, Mumbai)
- Skills that command premium (AI/ML, Cloud, Microservices)
- Hiring trends for 2025-26
- Footer CTA: Upskill with Sudaksha

---

## SECTION 6 — CONTENT TO SEED IN DATABASE

### 6.1 Blog Posts (seed these 6 articles)

```
Slug: 5-mistakes-freshers-make-coding
Title: 5 Mistakes Freshers Make When Learning to Code
Category: Career Advice
Read time: 5 min
Content: [Write 600-word article covering: starting with wrong language, tutorial hell, not building projects, ignoring soft skills, not networking. Include practical fixes for each.]

Slug: full-stack-vs-data-science
Title: Full Stack vs Data Science: Which Should You Choose in 2025?
Category: Career Guidance
Read time: 8 min
Content: [Write 900-word article with comparison table, salary data, job demand, skill requirements, and a decision framework based on personality type.]

Slug: first-tech-job-no-experience
Title: How to Get Your First Tech Job Without Experience
Category: Job Search
Read time: 6 min
Content: [Write 700-word article covering: building a portfolio, contributing to open source, networking on LinkedIn, internship strategies, how to frame non-tech experience.]

Slug: gccs-india-talent-opportunity-2025
Title: Why India's GCC Boom Is Creating 500,000 Tech Jobs in 2025
Category: Industry Insights
Read time: 6 min
Content: [Write 700-word article on Global Capability Centres growth in India, skill requirements, how professionals can position themselves, Sudaksha's role.]

Slug: pay-after-placement-guide
Title: Pay After Placement: Is It Right For You? A Complete Guide
Category: Career Guidance
Read time: 5 min
Content: [Explain ISA, PAP options clearly, compare with loans, pros/cons, Sudaksha's specific terms, success stories.]

Slug: automation-testing-career-2025
Title: Manual Tester to Automation Engineer: A Realistic 6-Month Roadmap
Category: Career Guidance
Read time: 7 min
Content: [Practical week-by-week roadmap covering Selenium, API testing, CI/CD, salary jump expectations, tools to learn, projects to build.]]
```

### 6.2 Webinars (seed these 4 upcoming events)

```
1. Title: Breaking Into Tech Without a CS Degree
   Date: April 12, 2026 | 11:00 AM IST
   Speaker: Priya Sharma, Career Coach at Sudaksha
   Description: A live session on how non-CS graduates can transition into high-paying tech roles.
   Type: Webinar | Platform: Zoom | Free

2. Title: GCC Readiness: Skills That Get You Hired in 2026
   Date: April 19, 2026 | 3:00 PM IST
   Speaker: Rajesh Menon, Delivery Head, TechMahindra
   Description: What Global Capability Centres are actually looking for — and how to prepare.
   Type: Webinar | Platform: Zoom | Free

3. Title: Build Your First Web App in 2 Hours
   Date: April 26, 2026 | 10:00 AM IST
   Speaker: Sudaksha Tech Team
   Description: Hands-on workshop — bring your laptop and leave with a deployed application.
   Type: Workshop | Platform: Zoom + Offline (Hyderabad) | Free

4. Title: The Pay After Placement Question: Everything You Need to Know
   Date: May 3, 2026 | 11:00 AM IST
   Speaker: Admissions Team, Sudaksha
   Description: Live Q&A session on Sudaksha's Pay After Placement, ISA, and scholarship options.
   Type: Q&A Webinar | Platform: Zoom | Free
```

---

## SECTION 7 — NEW PAGES TO BUILD

### 7.1 `/placement-report` (new page)

An interactive placement data page with:
- Animated counters for key metrics
- Filter by program / year / city
- Company logo grid (200+ hiring partners)
- Salary distribution chart (Chart.js or Recharts)
- Timeline to placement chart
- CTA: "View Full PDF Report" → download + capture

### 7.2 `/for-corporates/domestic` (referenced from homepage /for-corporates CTA)

Currently a 404. Build with:
- Domestic corporate training offerings
- Case studies from Indian companies
- Contact form for India-specific inquiries

### 7.3 `/career-paths` (footer link)

Interactive career path explorer:
- Grid of 8 career paths with icons
- Each path: Role → Skills Required → Salary → Sudaksha Program
- CTA per path: "Explore Program" → `/courses?filter=[path]`

### 7.4 `/certification` (footer link)

Page about Sudaksha certification program:
- What certifications Sudaksha offers
- Industry recognition
- Sample certificate preview
- CTA: "Get Certified" → enrollment modal

### 7.5 `/placement-support` (footer link)

Detailed page on placement support process:
- 6-stage placement process (resume → LinkedIn → GitHub → Interview Prep → Mock Interviews → Referral)
- Hiring company logos
- Stats
- CTA: "Start Your Journey"

### 7.6 `/events` (linked from /resources)

Events calendar page — currently shows 404. Link it to the webinars page or build a combined events/webinars page.

### 7.7 `/careers` (footer link — Sudaksha's own job openings)

Basic careers page with:
- "We're hiring trainers, counselors, and tech team members"
- Open positions list (placeholder: 3-4 roles)
- "Apply Now" form that captures to admin/communication with `intent: 'job_application'`

---

## SECTION 8 — VIDEO CONTENT PLACEHOLDERS

For every "Watch Video" CTA until actual videos are produced, build a video modal that:
1. Shows a high-quality poster image (use Sudaksha brand colors + student name)
2. Displays the student's story in a formatted card
3. Has a "Talk to a Counselor Like [Name]" CTA that opens the counselor modal
4. When a real video URL is available, replace poster with embedded YouTube/Vimeo player

**Video modals to build (minimum):**
- Priya Sharma story — /for-individuals, /why-sudaksha
- Rajesh Kumar story — /for-individuals, /why-sudaksha
- Meera Desai story — /for-individuals, /why-sudaksha
- Vikram Mehta story — /why-sudaksha
- Tier-3 College Principal — /why-sudaksha
- HR Head FinTech — /why-sudaksha
- "Watch Case Study" — /consult

---

## SECTION 9 — TESTING CHECKLIST

After completing all sections, run the following checks:

### Functional Tests
- [ ] `/courses` — courses load from API; fallback shows 6 static cards
- [ ] `/blog` — 6 articles render; filter tabs work
- [ ] `/webinars` — 4 upcoming webinars render
- [ ] Every form submits and shows confirmation message
- [ ] Every form submission creates a record in `/admin/communication`
- [ ] WhatsApp links open correctly (no double 91)
- [ ] All PDF downloads trigger file download
- [ ] All video modals open with poster + story content
- [ ] ROI calculator computes correctly
- [ ] EMI calculator computes correctly
- [ ] Admin dashboard loads and shows lead records
- [ ] Admin status update saves correctly
- [ ] CSV export generates valid file
- [ ] Floating WhatsApp button appears on all pages
- [ ] Sticky nav CTA appears on scroll

### Content Tests
- [ ] Copyright year shows 2026 everywhere
- [ ] Statistics are consistent across all pages (use canonical numbers from Section 4.4)
- [ ] No Africa/MENA references remain in FAQ
- [ ] No Feb 2025 dates remain anywhere
- [ ] Success stories use Indian alumni profiles

### Regression Tests
- [ ] Navigation links all resolve (no 404s)
- [ ] Footer links all resolve
- [ ] Mobile responsive — all modals work on mobile viewport
- [ ] All CTAs are keyboard accessible (tab + enter)

---

## APPENDIX — CANONICAL CONTACT DETAILS

Use these exact details everywhere — do not use any other variants:

```
Phone (Primary):  +91 91210 44435
Phone (Secondary): +91 80468 62777
WhatsApp:         https://wa.me/919121044435
Email (General):  info@sudaksha.com
Email (Corporate): corporate@sudaksha.com
Email (CRM):      crm@sudaksha.com
Address:          3rd Floor, Plot No. 705, Road No. 36,
                  Jubilee Hills, Hyderabad, Telangana 500033
Maps:             https://maps.google.com/?q=Jubilee+Hills+Hyderabad+500033
```

---

*End of Agent Prompt — v1.0 | Sudaksha.com Remediation*
*Total CTAs wired: 87 | New pages: 7 | PDFs to generate: 5 | Content assets: 10*
