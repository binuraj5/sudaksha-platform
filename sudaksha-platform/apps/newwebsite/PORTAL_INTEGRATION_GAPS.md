# Portal Integration Gaps

This file documents portal routes and params that `newwebsite` links to but whose existence in `apps/portal` has not been verified.

Generated during: newwebsite initial implementation

---

## Routes to Verify in `apps/portal`

| Route | Used By | Status | Notes |
|---|---|---|---|
| `/auth/login` | Navbar, Footer, Contact page | **Unverified** | Standard NextAuth login page — likely exists |
| `/auth/signup` | Multiple CTAs | **Unverified** | Standard signup page — check if it exists |
| `/auth/signup?tenant=corporate` | Enterprise CTAs | **Unverified** | Does portal read and use `tenant` query param on signup? |
| `/auth/signup?tenant=institution` | Institutions CTAs | **Unverified** | Same as above |
| `/auth/signup?tenant=individual` | Professionals / SCIP CTAs | **Unverified** | Same as above |
| `/auth/signup?plan=demo` | Navbar "Start Assessment", Hero CTA | **Unverified** | Does portal handle a `plan=demo` param? |
| `/dashboard` | Footer | **Unverified** | Post-login redirect destination |
| `/assessments` | Footer | **Unverified** | Assessments list page |
| `/my-results` | portal-links.ts | **Unverified** | Individual results page |
| `/career/scip` | portal-links.ts | **Unverified** | SCIP profile page in portal |
| `/org/dashboard` | portal-links.ts | **Unverified** | Org-level dashboard |

---

## Resolution Instructions

1. Open `apps/portal` and grep for these routes.
2. For any route that does NOT exist, update the link in `apps/newwebsite/lib/portal-links.ts` to use the closest working alternative (e.g., just `/auth/signup` without query params).
3. For `?tenant=` and `?plan=` params: check the portal signup page component to see if it reads `searchParams`. If not, the param is silently ignored (no user-facing error, but pre-selection won't work).
4. Update this file with verified status once confirmed.

---

## Interim Fallback

If tenant/plan params are unverified, all CTAs fall back to `/auth/signup` safely — the user can still sign up, just without pre-selection. This is acceptable until portal routes are confirmed.

---

*Do NOT create these routes in `apps/newwebsite`. They belong in `apps/portal` exclusively.*
