import { NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req, _event: NextFetchEvent) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const role = token?.role as string;
        const userType = (token as any)?.userType as string;
        const tenantSlug = (token as any)?.tenantSlug as string;

        // Root /admin (Sudaksha Admin) – cookie-based session; redirect to login if no session
        if (path.startsWith('/admin')) {
            const adminCookie = req.cookies.get('admin_session');
            if (path === '/admin/login' || path === '/admin/forgot-password') {
                if (adminCookie?.value) {
                    return NextResponse.redirect(new URL('/admin', req.url));
                }
                return NextResponse.next();
            }
            if (!adminCookie?.value) {
                const loginUrl = new URL('/admin/login', req.url);
                loginUrl.searchParams.set('callbackUrl', path);
                return NextResponse.redirect(loginUrl);
            }
            return NextResponse.next();
        }

        // Normalize legacy capitalized routes
        if (path === '/Assessment' || path.startsWith('/Assessment/')) {
            return NextResponse.redirect(new URL('/assessments', req.url));
        }
        if (path === '/assessments/admin/Dashboard') {
            return NextResponse.redirect(new URL('/assessments/admin/dashboard', req.url));
        }

        // 1. Super Admin Isolation (/assessments/admin)
        if (path.startsWith('/assessments/admin')) {
            const isSuperAdmin = userType === 'SUPER_ADMIN' || role === 'SUPER_ADMIN';
            if (!isSuperAdmin) {
                const loginUrl = new URL('/assessments/login', req.url);
                loginUrl.searchParams.set('callbackUrl', path);
                return NextResponse.redirect(loginUrl);
            }
        }

        // 2. Tenant Route Protection (/assessments/org/[slug])
        if (path.startsWith('/assessments/org/')) {
            const pathParts = path.split('/');
            const routeSlug = pathParts[3]; // /assessments/org/[slug]/...

            if (userType === 'SUPER_ADMIN') {
                return NextResponse.next();
            }

            // Allow TENANT, STUDENT, CLASS_TEACHER when tenantSlug matches route
            const orgRoles = ['TENANT', 'STUDENT', 'CLASS_TEACHER'];
            const hasOrgAccess = orgRoles.includes(userType || '') && tenantSlug === routeSlug;

            if (!hasOrgAccess) {
                if (tenantSlug) {
                    return NextResponse.redirect(new URL(`/assessments/org/${tenantSlug}/dashboard`, req.url));
                }
                return NextResponse.redirect(new URL('/assessments/login', req.url));
            }
        }

        // 2b. Logged-in user on /assessments (e.g. after login with callbackUrl=/assessments) → org dashboard when tenant
        if (path === '/assessments' && token && tenantSlug) {
            return NextResponse.redirect(new URL(`/assessments/org/${tenantSlug}/dashboard`, req.url));
        }

        // 3. Personal Workspace Protection (/assessments/my)
        if (path.startsWith('/assessments/my')) {
            if (!token) {
                return NextResponse.redirect(new URL('/assessments/login', req.url));
            }
        }

        // 4. Redirect logged-in users away from auth pages (AUTHENTICATION_ARCHITECTURE: role-based)
        if (token && (path === '/assessments/login' || path.startsWith('/assessments/register'))) {
            const callbackUrl = req.nextUrl.searchParams.get('callbackUrl');
            const clientId = (token as any)?.clientId as string | undefined;

            if (userType === 'SUPER_ADMIN' || role === 'SUPER_ADMIN') {
                return NextResponse.redirect(new URL('/assessments/admin/dashboard', req.url));
            }
            const orgRoles = ['TENANT_ADMIN', 'DEPARTMENT_HEAD', 'TEAM_LEAD', 'EMPLOYEE', 'DEPT_HEAD', 'MANAGER', 'ASSESSOR', 'STUDENT', 'CLASS_TEACHER'];
            // TENANT/ORG users: redirect to org dashboard (canonical) when tenantSlug exists
            if ((userType === 'TENANT' || orgRoles.includes(String(role))) && clientId) {
                if (tenantSlug) {
                    const orgDashboard = `/assessments/org/${tenantSlug}/dashboard`;
                    if (callbackUrl?.startsWith('/assessments/org/') && callbackUrl.includes(tenantSlug)) {
                        return NextResponse.redirect(new URL(callbackUrl, req.url));
                    }
                    return NextResponse.redirect(new URL(orgDashboard, req.url));
                }
                if (callbackUrl?.startsWith('/assessments/clients/') && callbackUrl.includes(clientId)) {
                    return NextResponse.redirect(new URL(callbackUrl, req.url));
                }
                return NextResponse.redirect(new URL(`/assessments/clients/${clientId}/dashboard`, req.url));
            }
            // B2C: INDIVIDUAL or STUDENT without clientId → individuals dashboard
            if (role === 'INDIVIDUAL' || (role === 'STUDENT' && !clientId)) {
                return NextResponse.redirect(new URL('/assessments/individuals/dashboard', req.url));
            }
            return NextResponse.redirect(new URL('/assessments/my/dashboard', req.url));
        }

        return NextResponse.next();
    },
    {
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;
                // Public routes that don't need auth (Marketing & Platform Auth)
                const publicPaths = [
                    '/',
                    '/features',
                    '/pricing',
                    '/about',
                    '/contact',
                    '/assessments/login',
                    '/assessments/register',
                    '/assessments/auth/admin/login',
                    '/assessments/verify-email',
                    '/assessments/forgot-password',
                    '/admin/forgot-password',
                    '/assessments/reset-password',
                    '/assessments',
                    '/assessments/',
                    '/assessments/login-debug-view',
                    '/Assessment',
                ];

                if (publicPaths.includes(path) || path.startsWith('/assessments/invite/') || path.startsWith('/api/auth')) {
                    return true;
                }

                // If it's a platform route but not in publicPaths, require token
                if (path.startsWith('/assessments')) {
                    return !!token;
                }

                // Everything else (Sudaksha Website) is public
                return true;
            },
        },
        pages: {
            signIn: "/admin/login",
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
