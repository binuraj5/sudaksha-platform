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
