# SUDAKSHA NEW WEBSITE — IMPLEMENTATION PROMPT
## For Antigravity Coding Agent

---

## MANDATORY PRE-READ BEFORE TOUCHING ANY CODE

Before writing a single line, read these files in full:
1. `sudaksha-platform/apps/portal/MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md`
2. `sudaksha-platform/apps/portal/ROLES_COMPETENCIES_RLS_POLYMORPHIC.md`
3. `sudaksha-platform/apps/portal/CURSOR_REUSE_COMPONENTS_INSTRUCTION.md`

You must understand the portal's auth system, routing conventions, and component architecture before building any links or integrations.

---

## WHAT YOU ARE BUILDING

### The Repository Structure After This Task

```
sudaksha-platform/
├── apps/
│   ├── portal/          ← EXISTING — Assessment portal. DO NOT TOUCH.
│   ├── website/         ← EXISTING — Old website. DO NOT TOUCH.
│   └── newwebsite/      ← NEW — You are building this.
├── packages/            ← Shared packages (if any)
└── turbo.json           ← Update to include newwebsite
```

### What `newwebsite` Is

A brand-new public marketing website for Sudaksha. It is:
- A **Next.js App Router** application (same stack as portal)
- Hosted at a separate domain/subdomain (e.g., `sudaksha.com` or `www.sudaksha.com`)
- **Completely separate** from the assessment portal (`portal` app)
- **Logically linked** to the portal via smart CTAs, sign-in/sign-up redirects, and deep links into specific portal sections
- The old `website` app is untouched and preserved

---

## CRITICAL ARCHITECTURE RULES

### DO NOT
- Modify any file inside `apps/portal/`
- Modify any file inside `apps/website/`
- Import components from `apps/portal/` directly into `apps/newwebsite/`
- Hardcode portal URLs — use environment variables
- Share auth state between newwebsite and portal (they are separate apps)
- Create duplicate auth logic in newwebsite (portal handles all auth)

### DO
- Create `apps/newwebsite/` as a fully independent Next.js app
- Use environment variables for all portal URLs (see Portal Integration section)
- Link to portal using standard anchor tags / `window.location` redirects
- Create shared UI components only in `packages/ui-shared/` if one doesn't exist
- Follow the same TypeScript + Tailwind conventions as the portal
- Update `turbo.json` and root `package.json` to include `newwebsite`

---

## SETUP — SCAFFOLD THE NEW APP

### Step 1: Scaffold

```bash
cd sudaksha-platform
npx create-next-app@latest apps/newwebsite \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

### Step 2: Install Dependencies

```bash
cd apps/newwebsite
npm install framer-motion lucide-react class-variance-authority clsx
npm install @next/font
```

### Step 3: Environment Variables

Create `apps/newwebsite/.env.local`:

```env
# Portal base URL — all CTA links point here
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000

# Specific portal entry points
NEXT_PUBLIC_PORTAL_SIGNUP_URL=http://localhost:3000/auth/signup
NEXT_PUBLIC_PORTAL_LOGIN_URL=http://localhost:3000/auth/login
NEXT_PUBLIC_PORTAL_DEMO_URL=http://localhost:3000/auth/signup?plan=demo
NEXT_PUBLIC_PORTAL_CORPORATE_SIGNUP=http://localhost:3000/auth/signup?tenant=corporate
NEXT_PUBLIC_PORTAL_INSTITUTION_SIGNUP=http://localhost:3000/auth/signup?tenant=institution
NEXT_PUBLIC_PORTAL_INDIVIDUAL_SIGNUP=http://localhost:3000/auth/signup?tenant=individual
NEXT_PUBLIC_PORTAL_DASHBOARD_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_PORTAL_ASSESSMENTS_URL=http://localhost:3000/assessments
NEXT_PUBLIC_PORTAL_SCIP_URL=http://localhost:3000/career/scip

# Production values (override in Vercel/server env)
# NEXT_PUBLIC_PORTAL_URL=https://app.sudaksha.com
```

Create `apps/newwebsite/.env.example` with the same keys but empty values — commit this.

### Step 4: Update Turborepo

In `turbo.json`, add `newwebsite` to the pipeline alongside `portal` and `website`.

In root `package.json` workspaces array, add `"apps/newwebsite"`.

---

## BRAND & DESIGN SYSTEM

### Colors

```css
/* apps/newwebsite/app/globals.css */
:root {
  --ink:         #0d1b3e;   /* Darkest navy — hero bg, footer */
  --navy:        #0f2456;   /* Deep navy — dark section bg */
  --royal:       #1565c0;   /* Primary brand blue */
  --mid-blue:    #1976d2;   /* Medium blue — hover states */
  --bright:      #2196f3;   /* Bright blue — links, tags */
  --orange:      #f5a023;   /* Primary accent — CTAs, highlights */
  --orange-lt:   #ffb84d;   /* Light orange — hover */
  --sky:         #64b5f6;   /* Sky blue — dark-bg text */
  --sky-pale:    #e8f2ff;   /* Very light blue — section bg */
  --white:       #ffffff;
  --dark:        #1a1a2e;   /* Body text */
  --muted:       #5a7fa8;   /* Secondary text */
  --lt-muted:    #90b4d4;   /* Tertiary text */
  --border:      rgba(21,101,192,0.15);
}
```

### Typography

```typescript
// apps/newwebsite/app/layout.tsx
import { Fraunces } from 'next/font/google'
import { DM_Sans } from 'next/font/google'
import { DM_Mono } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' })
const dmSans   = DM_Sans({ subsets: ['latin'], variable: '--font-body' })
const dmMono   = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] })
```

- **Display / Headlines:** `Fraunces` — serif, editorial, weighted
- **Body / UI:** `DM Sans` — clean, modern sans
- **Labels / Code / Tags:** `DM Mono` — monospace for technical feel

### Butterfly Logo SVG

Always use this exact SVG for the Sudaksha logo mark. It matches the real logo:

```svg
<svg width="38" height="34" viewBox="0 0 38 34" fill="none">
  <!-- Left wing — sky blue -->
  <ellipse cx="12" cy="14" rx="12" ry="10" fill="#2196F3" opacity="0.9" transform="rotate(-20 12 14)"/>
  <!-- Right wing — orange -->
  <ellipse cx="26" cy="10" rx="10" ry="7" fill="#F5A023" opacity="0.95" transform="rotate(15 26 10)"/>
  <!-- Lower left wing — royal blue -->
  <ellipse cx="10" cy="22" rx="9" ry="7" fill="#1565C0" opacity="0.7" transform="rotate(10 10 22)"/>
  <!-- Lower right wing — amber -->
  <ellipse cx="24" cy="20" rx="7" ry="5" fill="#FF9800" opacity="0.7" transform="rotate(-10 24 20)"/>
  <!-- Body -->
  <ellipse cx="18" cy="17" rx="2" ry="9" fill="#1A1A2E" opacity="0.6"/>
  <!-- Antennae -->
  <line x1="18" y1="8" x2="13" y2="2" stroke="#1A1A2E" stroke-width="1.2" opacity="0.5"/>
  <line x1="18" y1="8" x2="23" y2="2" stroke="#1A1A2E" stroke-width="1.2" opacity="0.5"/>
  <circle cx="13" cy="2" r="1.2" fill="#1A1A2E" opacity="0.5"/>
  <circle cx="23" cy="2" r="1.2" fill="#1A1A2E" opacity="0.5"/>
</svg>
```

---

## FILE STRUCTURE TO BUILD

```
apps/newwebsite/
├── app/
│   ├── layout.tsx                    ← Root layout, fonts, metadata
│   ├── globals.css                   ← CSS variables, base styles
│   ├── page.tsx                      ← Homepage (/)
│   ├── what-we-do/
│   │   └── page.tsx                  ← IMPACT Framework detail page
│   ├── enterprise/
│   │   └── page.tsx                  ← Corporate audience page
│   ├── institutions/
│   │   └── page.tsx                  ← Institutional audience page
│   ├── professionals/
│   │   └── page.tsx                  ← Individual/professional page
│   ├── sudassess/
│   │   └── page.tsx                  ← SudAssess™ platform product page
│   ├── scip/
│   │   └── page.tsx                  ← SCIP™ psychometric profile page
│   ├── thinking/
│   │   ├── page.tsx                  ← Thought leadership index
│   │   └── [slug]/
│   │       └── page.tsx              ← Individual article (static for now)
│   ├── about/
│   │   └── page.tsx                  ← About Sudaksha
│   ├── contact/
│   │   └── page.tsx                  ← Contact form
│   └── api/
│       └── contact/
│           └── route.ts              ← Contact form API handler
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                ← Sticky nav with portal CTAs
│   │   └── Footer.tsx                ← Full footer with portal links
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── MarqueeStrip.tsx
│   │   ├── ImpactFramework.tsx
│   │   ├── AudienceCards.tsx
│   │   ├── SectorsStrip.tsx
│   │   ├── PlatformSection.tsx
│   │   ├── ScipSection.tsx
│   │   ├── WhySudaksha.tsx
│   │   └── CtaSection.tsx
│   ├── shared/
│   │   ├── PortalCTA.tsx             ← Reusable portal link button
│   │   ├── SectionHeader.tsx
│   │   ├── AnimatedCounter.tsx
│   │   └── DashboardMockup.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Card.tsx
├── lib/
│   ├── portal-links.ts               ← All portal URL helpers (CRITICAL)
│   └── constants.ts                  ← Site-wide constants
├── public/
│   └── (static assets)
├── .env.local                        ← Portal URLs (gitignored)
├── .env.example                      ← Committed template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## PORTAL LINK HELPER — BUILD THIS FIRST

This is the most critical file. All links to the portal must go through this helper — never hardcode URLs anywhere else.

```typescript
// apps/newwebsite/lib/portal-links.ts

const PORTAL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3000'

export const portalLinks = {
  // Auth
  login:   `${PORTAL}/auth/login`,
  signup:  `${PORTAL}/auth/signup`,
  demo:    `${PORTAL}/auth/signup?plan=demo`,

  // Tenant-specific signup
  corporate:   `${PORTAL}/auth/signup?tenant=corporate`,
  institution: `${PORTAL}/auth/signup?tenant=institution`,
  individual:  `${PORTAL}/auth/signup?tenant=individual`,

  // Portal sections (post-login deep links)
  dashboard:    `${PORTAL}/dashboard`,
  assessments:  `${PORTAL}/assessments`,
  myResults:    `${PORTAL}/my-results`,
  scip:         `${PORTAL}/career/scip`,
  orgDashboard: `${PORTAL}/org/dashboard`,

  // Helpers
  withSource: (url: string, source: string) =>
    `${url}${url.includes('?') ? '&' : '?'}utm_source=website&utm_medium=${source}`,
} as const

export type PortalLink = typeof portalLinks
```

---

## COMPONENTS TO BUILD

### 1. Navbar (`components/layout/Navbar.tsx`)

**Behaviour:**
- Sticky, `position: fixed`, `top: 0`
- White background with `backdrop-filter: blur(20px)` and subtle bottom border
- Logo: SVG butterfly + "SUDAKSHA" wordmark + "Talent Architecture" sub-label
- Navigation links (all internal `<Link>` to newwebsite pages):
  - What We Do → `/what-we-do`
  - Enterprise → `/enterprise`
  - Institutions → `/institutions`
  - Professionals → `/professionals`
  - SudAssess™ → `/sudassess` (highlighted in `--orange`)
  - Thinking → `/thinking`
  - About → `/about`
- Right side CTAs:
  - "Login" → `portalLinks.login` (ghost button, opens portal login)
  - "Start Assessment →" → `portalLinks.demo` (filled button in `--royal`)
- Mobile: hamburger menu that collapses nav links
- Active state: current page link has orange underline indicator

```typescript
// Key portal link usage example:
import { portalLinks } from '@/lib/portal-links'

<a href={portalLinks.login} className="btn-ghost">Login</a>
<a href={portalLinks.demo} className="btn-primary">Start Assessment →</a>
```

### 2. Footer (`components/layout/Footer.tsx`)

Four-column footer. Dark navy background (`--navy`).

**Column 1 — Brand:**
- Butterfly SVG + wordmark
- Tagline: "Talent by Design. Performance by Science."

**Column 2 — Services:**
- What We Do → `/what-we-do`
- Enterprise → `/enterprise`
- Institutions → `/institutions`
- Professionals → `/professionals`
- IMPACT Framework™ → `/what-we-do#impact`

**Column 3 — Platform (Portal Links):**
- SudAssess™ → `/sudassess`
- SCIP™ Profile → `/scip`
- Start Free Assessment → `portalLinks.demo`
- Login to Portal → `portalLinks.login`
- Request Demo → `/contact?subject=demo`

**Column 4 — Company:**
- About Us → `/about`
- Our Thinking → `/thinking`
- Case Studies → `/thinking#case-studies`
- Careers → `/about#careers`
- Contact → `/contact`

**Bottom bar:**
- Left: © 2025 Sudaksha Education (P) Ltd
- Right: Privacy Policy | Terms of Use

### 3. PortalCTA (`components/shared/PortalCTA.tsx`)

Reusable component used on every page. Props:

```typescript
interface PortalCTAProps {
  variant: 'corporate' | 'institution' | 'individual' | 'demo' | 'login'
  label?: string            // Override default label
  size?: 'sm' | 'md' | 'lg'
  style?: 'filled' | 'ghost' | 'outline'
  source?: string           // UTM source for analytics
}
```

Always uses `portalLinks` internally. Never accepts a raw URL prop.

---

## PAGE-BY-PAGE SPECIFICATIONS

### Homepage (`app/page.tsx`)

Assemble from home section components. Section order:

1. **HeroSection** — Full viewport. Dark navy bg. Two-column grid.
   - Left: Eyebrow label + H1 + subheading + two CTAs + stats row
   - H1: `"We don't train people. We transform organizations."`
   - Primary CTA: "Explore Our Approach →" → scrolls to `#impact`
   - Secondary CTA: "Start Free Assessment" → `portalLinks.demo`
   - Stats: `500+ Organizations | 94% ROI | 18+ Sectors`
   - Right: Animated orbit visual with nodes (CSS animation, no library)

2. **MarqueeStrip** — Orange bg. Scrolling keywords: `Competency Mapping · Organizational Development · AI-Driven Assessment · Behavioral Science · Talent Architecture · OB Interventions · Workforce Intelligence · Career Intelligence`

3. **ImpactFramework** (`id="impact"`) — Light blue bg. 6-step horizontal grid.
   - Steps: Investigate → Map → Prescribe → Act → Commit → Transform
   - Each step: Letter + stage number + title + description
   - Hover: card flips to royal blue with white text

4. **AudienceCards** — White bg. 3-column cards.
   - Enterprise, Institutions, Professionals
   - Each card has journey flow + CTA linking to its audience page AND to portal signup with correct tenant param:
     - Enterprise card CTA → `/enterprise` + secondary link → `portalLinks.corporate`
     - Institutions card CTA → `/institutions` + secondary link → `portalLinks.institution`
     - Professionals card CTA → `/professionals` + secondary link → `portalLinks.individual`

5. **SectorsStrip** — Royal blue bg. 8 sector icons in a row.

6. **PlatformSection** — Dark navy bg. Two-column.
   - Left: SudAssess™ description + feature list + "Request Demo" CTA → `/contact?subject=demo`
   - Right: Dashboard mockup (build as a static visual component, no real data)

7. **ScipSection** — Light blue bg. SCIP wheel + 5 dimension cards.
   - CTA: "Get Your SCIP™ Profile" → `portalLinks.individual`

8. **WhySudaksha** — White bg. 6 USP cards in 3×2 grid.

9. **CtaSection** — Dark navy bg. Centred.
   - Headline: `"Ready to architect real capability?"`
   - Primary CTA: "Request a Diagnostic Call" → `/contact?subject=diagnostic`
   - Secondary CTA: "Explore SudAssess™" → `/sudassess`

---

### What We Do Page (`app/what-we-do/page.tsx`)

Sections:
1. Page hero — "Methodology-first. Outcomes-always."
2. The IMPACT Framework™ — expanded detail for each of the 6 stages (longer descriptions than homepage)
3. Why methodology matters — prose section explaining assessment-led approach
4. The three audiences — cards linking to `/enterprise`, `/institutions`, `/professionals`
5. CTA → `portalLinks.demo`

---

### Enterprise Page (`app/enterprise/page.tsx`)

Sections:
1. Hero — "Stop training people. Start transforming your organisation."
2. The corporate talent problem — pain points
3. How Sudaksha serves Enterprise — full IMPACT flow customised for corporate language
4. SudAssess™ for Enterprise — feature highlights relevant to corporate users
5. Role hierarchy served — SuperAdmin → TenantAdmin → Department Head → Team Leader → Employee (visual)
6. Case study teaser — Tanzania Revenue Authority (TRA ICT Dept) — described without confidential data
7. CTA block:
   - "Request Enterprise Demo" → `/contact?subject=enterprise-demo`
   - "Start with an Assessment" → `portalLinks.corporate`

---

### Institutions Page (`app/institutions/page.tsx`)

Sections:
1. Hero — "Your students deserve to be hired — not just graduated."
2. The Graduate Employability Problem
3. The Graduate Employability Pipeline™ — 7-step visual flow
4. Three-way value triangle — Institution / Student / Recruiter
5. SudAssess™ for Institutions — student assessment, employability grading, recruiter portal
6. Typical engagement model — timeline visual
7. CTA block:
   - "Book a Campus Assessment" → `/contact?subject=institution-demo`
   - "Start a Student Assessment" → `portalLinks.institution`

---

### Professionals Page (`app/professionals/page.tsx`)

Sections:
1. Hero — "You know where you are. We help you get where you want to be — faster."
2. The career clarity problem
3. How it works for you — 4-step journey
4. SCIP™ Career Intelligence Profile — detailed breakdown
5. What you get — report outputs explainer
6. CTA block:
   - "Start Your Career Profile" → `portalLinks.individual`
   - "Learn about SCIP™" → `/scip`

---

### SudAssess™ Page (`app/sudassess/page.tsx`)

This is the platform product page. Sections:
1. Hero — "The Engine That Proves Capability" — with animated dashboard mockup
2. How it works (5 steps)
3. Full feature grid (9 feature cards)
4. Three-tenant architecture breakdown
5. Assessment engine explainer — IRT + adaptive CAT detail
6. SCIP™ integration callout → `/scip`
7. Integrations / tech stack panel
8. Pricing/plans section (3 tiers)
9. CTA — "Book a 30-Min Demo" → `/contact?subject=sudassess-demo`

---

### SCIP™ Page (`app/scip/page.tsx`)

Sections:
1. Hero — "Know yourself. Design your career."
2. The five dimensions — detailed cards for each
3. What you get — sample report outputs
4. Why SCIP™ vs other tools — comparison table (MBTI/Thomas/etc vs SCIP™)
5. CTA: "Get Your SCIP™ Profile" → `portalLinks.individual`

---

### Thinking Page (`app/thinking/page.tsx`)

For now, build as a static placeholder with:
- Page hero
- 3–6 static "article" cards with placeholder content
- Categories: Talent Architecture | Assessment Science | Career Intelligence | OD Strategy
- Each card links to `/thinking/[slug]` — build one sample article page

---

### About Page (`app/about/page.tsx`)

Sections:
1. Who we are
2. Our origin story — brief
3. The name Sudaksha (Sanskrit meaning)
4. Where we operate — India, Africa, Southeast Asia
5. CTA → `/contact`

---

### Contact Page (`app/contact/page.tsx`)

Sections:
1. Simple contact form: Name, Email, Organisation, Subject (dropdown), Message
2. Subject dropdown options: General Inquiry | Enterprise Demo | Institution Demo | Diagnostic Call | SudAssess™ Demo | Partnership
3. Form submits to `app/api/contact/route.ts` — just log to console for now, wire to email later
4. Direct email/phone display
5. Note: "If you're looking to log in or access your assessments, go to the [Assessment Portal →](`portalLinks.login`)"

---

## PORTAL INTEGRATION — COMPLETE LINK MAP

This is the definitive map of every point where newwebsite links to portal. Use `portalLinks` for ALL of these — never hardcode:

| Location | Link Target | Portal URL | Behaviour |
|---|---|---|---|
| Navbar — "Login" | `portalLinks.login` | `/auth/login` | New tab or same tab |
| Navbar — "Start Assessment →" | `portalLinks.demo` | `/auth/signup?plan=demo` | Same tab |
| Hero primary CTA (some pages) | `portalLinks.demo` | `/auth/signup?plan=demo` | Same tab |
| Enterprise card / page CTA | `portalLinks.corporate` | `/auth/signup?tenant=corporate` | Same tab |
| Institutions card / page CTA | `portalLinks.institution` | `/auth/signup?tenant=institution` | Same tab |
| Professionals card / page CTA | `portalLinks.individual` | `/auth/signup?tenant=individual` | Same tab |
| SCIP section / page CTA | `portalLinks.individual` | `/auth/signup?tenant=individual` | Same tab |
| Footer — "Login to Portal" | `portalLinks.login` | `/auth/login` | Same tab |
| Footer — "Start Free Assessment" | `portalLinks.demo` | `/auth/signup?plan=demo` | Same tab |
| Contact page notice | `portalLinks.login` | `/auth/login` | Inline link |
| SudAssess™ page demo CTA | Leads to `/contact?subject=sudassess-demo` | Internal | Internal |

**Rule:** Any CTA that says "Start", "Begin", "Get Started", "Try", or "Sign Up" goes to the relevant portal signup. Any CTA that says "Learn more", "Explore", or "See how it works" goes to an internal page.

---

## METADATA & SEO

Each page must have a `generateMetadata()` export with:
- Unique `title` — format: `"Page Title | Sudaksha — Talent Architecture"`
- Unique `description` — 150–160 characters, includes "SudAssess™" or "SCIP™" where relevant
- `openGraph` with title, description, type, and placeholder image
- `keywords` relevant to the page topic

Root layout `metadata`:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sudaksha.com'),
  title: { default: 'Sudaksha — Talent Architecture & Organizational Development', template: '%s | Sudaksha' },
  description: 'AI-powered competency assessment, organizational development, and talent architecture. Powered by SudAssess™.',
}
```

---

## ANIMATIONS & INTERACTIONS

Use **CSS animations** for most effects (no library dependency). Use **Framer Motion** only for:
- Page entry animations (staggered section reveals on scroll)
- Card hover 3D effects

Key animations to implement:
- `fadeUp` — elements enter from below on scroll intersect
- `marquee` — infinite scroll strip (CSS only)
- `float` — orbit visual in hero gently floats up/down
- `spin` — orbit ring slow rotation (CSS `@keyframes spin`)
- `pulse` — live indicator dots
- `countUp` — stats numbers count up when they enter viewport (JS)
- `barGrow` — dashboard chart bars grow upward on enter

All animated elements: use `IntersectionObserver` with staggered `animation-delay` based on index. Do not animate all at once.

---

## WHAT THE PORTAL NEEDS TO SUPPORT (VERIFY BEFORE LINKING)

Before setting up portal links, verify these routes exist in `apps/portal`:
- `[ ] /auth/login` — login page
- `[ ] /auth/signup` — signup page
- `[ ] /auth/signup?tenant=corporate` — does the portal read and use this param?
- `[ ] /auth/signup?tenant=institution` — same check
- `[ ] /auth/signup?tenant=individual` — same check
- `[ ] /auth/signup?plan=demo` — does the portal handle a demo plan?

**If these routes or params don't exist yet in the portal**, document which ones are missing in a file: `apps/newwebsite/PORTAL_INTEGRATION_GAPS.md`. Do NOT create these routes in newwebsite — they belong in the portal. Just note the gap and use the closest working alternative in the meantime (e.g., just `/auth/signup` without params).

---

## DEVELOPMENT SERVER

After scaffolding, the newwebsite should run independently:

```bash
# From repo root (Turborepo)
turbo dev --filter=newwebsite

# Or directly
cd apps/newwebsite && npm run dev
# Runs on port 3001 (set in next.config.ts to avoid conflict with portal on 3000)
```

Set port in `apps/newwebsite/next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  // newwebsite runs on 3001 to avoid conflict with portal (3000)
  // Override via PORT env variable in production
}
```

And in `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001",
  ...
}
```

---

## DO NOT DO LIST (HARD STOPS)

1. ❌ **Do NOT modify `apps/portal/` or `apps/website/` in any way**
2. ❌ **Do NOT import from `apps/portal/` into `apps/newwebsite/`**
3. ❌ **Do NOT create auth pages in newwebsite** — all auth is in portal
4. ❌ **Do NOT hardcode portal URLs** — always use `portalLinks` from `lib/portal-links.ts`
5. ❌ **Do NOT use `router.push()` for external portal links** — use `<a href>` or `window.location.href`
6. ❌ **Do NOT share sessions or cookies between apps** — they are separate Next.js apps
7. ❌ **Do NOT skip the `.env.example` file** — it must be committed
8. ❌ **Do NOT use `Inter` or `Roboto` fonts** — use Fraunces + DM Sans + DM Mono as specified
9. ❌ **Do NOT build placeholder pages with "Coming Soon"** — build real content using the copy in this document
10. ❌ **Do NOT create the pitch deck** — that is a separate task

---

## VERIFICATION CHECKLIST

After completing the implementation, verify:

```
STRUCTURE
[ ] apps/newwebsite/ exists and is a valid Next.js app
[ ] apps/portal/ is unchanged (git diff shows 0 changes)
[ ] apps/website/ is unchanged (git diff shows 0 changes)
[ ] turbo.json includes newwebsite
[ ] .env.example committed with all portal URL keys

PORTAL LINKS
[ ] lib/portal-links.ts exists with all links
[ ] No hardcoded portal URLs anywhere in codebase
[ ] Navbar Login button links to portal login
[ ] Navbar "Start Assessment" button links to portal signup
[ ] Enterprise page CTA links to portal with ?tenant=corporate
[ ] Institutions page CTA links to portal with ?tenant=institution
[ ] Professionals / SCIP page CTA links to portal with ?tenant=individual
[ ] Footer has portal links in correct column
[ ] Contact page has note linking to portal for existing users

PAGES
[ ] / (homepage) builds and renders all 9 sections
[ ] /what-we-do
[ ] /enterprise
[ ] /institutions
[ ] /professionals
[ ] /sudassess
[ ] /scip
[ ] /thinking
[ ] /about
[ ] /contact
[ ] All pages have metadata (title + description)

DESIGN
[ ] Fraunces + DM Sans + DM Mono fonts loaded
[ ] CSS variables defined in globals.css
[ ] Brand colors correct (royal blue #1565C0, orange #F5A023)
[ ] Butterfly SVG logo used in navbar and footer
[ ] Mobile responsive (check /enterprise and /sudassess on 375px)
[ ] Scroll animations working (IntersectionObserver)

DEVELOPMENT
[ ] npm run dev starts on port 3001 without errors
[ ] turbo dev --filter=newwebsite works from repo root
[ ] No TypeScript errors (npm run build passes)
[ ] No console errors on any page
```

---

## COPY REFERENCE

For all headline and body copy, use the Sudaksha brand voice:
- **Authoritative** — data-backed, confident
- **Direct** — no filler
- **Human** — people-centred
- **Ambitious** — outcome language, not activity language

**Words we own:** architect, measure, transform, prove, precision, capability
**Words we avoid:** solutions, affordable, courses/modules, "we provide/offer"

**Key tagline:** `"Talent by Design. Performance by Science."`
**Hero H1:** `"We don't train people. We transform organizations."`

Section-level headlines are specified per page above. Follow them exactly — do not improvise different copy.

---

*End of Implementation Prompt*
*Document: SUDAKSHA_NEWWEBSITE_IMPLEMENTATION_PROMPT.md*
*Version: 1.0 | March 2025*
