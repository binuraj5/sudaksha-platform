import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
    useSecureCookies: process.env.NODE_ENV === "production",
    session: {
        strategy: "jwt" as const,
    },
    pages: {
        signIn: "/assessments/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                isAdmin: { label: "Is Admin", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const emailNorm = String(credentials.email).trim().toLowerCase();
                    console.log(`[AUTH] Attempting login for: ${credentials.email}`);

                    // Case-insensitive email lookup (DB may store Info@tra.tz, user types info@tra.tz)
                    const emailFilter = { equals: emailNorm, mode: "insensitive" as const };

                    // 1. Check AdminUser Table first (Super Admin)
                    // Allow both dedicated admin login and standard login to work.
                    const adminUser = await prisma.adminUser.findFirst({
                        where: { email: emailFilter }
                    });

                    if (adminUser && adminUser.isActive) {
                        const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);
                        if (isPasswordValid) {
                            console.log(`[AUTH] Admin login successful: ${credentials.email}`);
                            // Update last login
                            await prisma.adminUser.update({
                                where: { id: adminUser.id },
                                data: { lastLoginAt: new Date() }
                            });
                            return {
                                id: adminUser.id,
                                email: adminUser.email,
                                name: adminUser.name,
                                role: "SUPER_ADMIN",
                                userType: "SUPER_ADMIN"
                            };
                        }
                    }

                    // 2. Regular User Login Logic
                    let user = await prisma.user.findFirst({
                        where: { email: emailFilter },
                        include: { client: true }
                    });

                    // 2b. Member-only fallback: some flows (e.g. register-client) create Member but not User
                    let member = user
                        ? await prisma.member.findFirst({
                              where: { email: { equals: user.email, mode: "insensitive" as const } },
                              include: {
                                  managedUnits: { where: { isActive: true }, select: { id: true, type: true } },
                                  tenant: true
                              }
                          })
                        : await prisma.member.findFirst({
                              where: { email: emailFilter },
                              include: {
                                  managedUnits: { where: { isActive: true }, select: { id: true, type: true } },
                                  tenant: true
                              }
                          });

                    if (!user && member) {
                        // Member-only: authenticate with Member.password
                        if (!member.password) {
                            console.log(`[AUTH] Member has no password: ${credentials.email}`);
                            return null;
                        }
                        let valid = false;
                        try {
                            valid = await bcrypt.compare(credentials.password, member.password);
                        } catch (e) {
                            console.error("[AUTH] bcrypt.compare error:", e);
                            return null;
                        }
                        if (!valid) return null;
                        const tenantSlug = member.tenant?.slug || null;
                        const resolvedClientId = member.type === "INDIVIDUAL" ? null : (member.tenantId || null);
                        const resolvedUserType =
                            member.type === "INDIVIDUAL" || (member.role as string) === "STUDENT"
                                ? (member.type === "INDIVIDUAL" ? "INDIVIDUAL" : "STUDENT")
                                : "TENANT";
                        const isB2C = member.type === "INDIVIDUAL";
                        // Preserve actual role (DEPT_HEAD, TEAM_LEAD, etc.) and managedOrgUnitId from managedUnits
                        let role: string = member.role === "TENANT_ADMIN" ? "TENANT_ADMIN" : member.type === "INDIVIDUAL" ? "INDIVIDUAL" : "EMPLOYEE";
                        let managedOrgUnitId: string | null = null;
                        if (member.managedUnits?.length > 0) {
                            const dept = member.managedUnits.find((u: any) => u.type === "DEPARTMENT");
                            if (dept) {
                                role = "DEPT_HEAD";
                                managedOrgUnitId = dept.id;
                            } else {
                                const team = member.managedUnits.find((u: any) => u.type === "TEAM");
                                if (team) {
                                    role = "TEAM_LEAD";
                                    managedOrgUnitId = team.id;
                                }
                            }
                        }
                        const preservedRoles = ["MANAGER", "ASSESSOR", "STUDENT", "CLASS_TEACHER"];
                        if (role === "EMPLOYEE" && preservedRoles.includes(member.role as string)) {
                            role = member.role as string;
                        }
                        return {
                            id: member.id,
                            email: member.email,
                            name: member.name,
                            role,
                            userType: resolvedUserType,
                            clientId: isB2C ? null : resolvedClientId,
                            tenantId: isB2C ? null : resolvedClientId,
                            tenantSlug: isB2C ? null : tenantSlug,
                            managedOrgUnitId
                        };
                    }

                    if (!user) {
                        console.log(`[AUTH] User not found: ${credentials.email}`);
                        return null;
                    }

                    if (!user.isActive) {
                        console.log(`[AUTH] User suspended: ${credentials.email}`);
                        throw new Error("Account suspended. Please contact support.");
                    }

                    // Check for lockout
                    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
                        console.log(`[AUTH] User locked out: ${credentials.email}`);
                        throw new Error("Account locked due to multiple failed attempts. Try again later.");
                    }

                    if (!user.password) {
                        console.log(`[AUTH] User has no password set: ${credentials.email}`);
                        return null;
                    }

                    let isPasswordValid = false;
                    try {
                        isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    } catch (e) {
                        console.error("[AUTH] bcrypt.compare error:", e);
                        return null;
                    }

                    if (!isPasswordValid) {
                        console.log(`[AUTH] Invalid password for: ${credentials.email}`);
                        const newFailedAttempts = (user.failedAttempts || 0) + 1;
                        const updateData: any = { failedAttempts: newFailedAttempts };
                        if (newFailedAttempts >= 5) {
                            updateData.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
                        }
                        await prisma.user.update({
                            where: { id: user.id },
                            data: updateData
                        });
                        return null;
                    }

                    // Reset failed attempts on success
                    if ((user.failedAttempts || 0) > 0) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { failedAttempts: 0, lockoutUntil: null }
                        });
                    }

                    // Role Detection & Enhancements
                    if (!member) {
                        member = await prisma.member.findFirst({
                            where: { email: { equals: user.email, mode: "insensitive" as const } },
                            include: {
                                managedUnits: { where: { isActive: true }, select: { id: true, type: true } },
                                tenant: true
                            }
                        });
                    }

                    let role = user.role;
                    let managedOrgUnitId = null;
                    let tenantSlug = user.client?.slug || (member?.tenant as any)?.slug || null;

                    if (member && member.managedUnits?.length > 0) {
                        const dept = member.managedUnits.find((u: any) => u.type === 'DEPARTMENT');
                        if (dept) {
                            role = 'DEPT_HEAD' as any;
                            managedOrgUnitId = dept.id;
                        } else {
                            const team = member.managedUnits.find((u: any) => u.type === 'TEAM');
                            if (team) {
                                role = 'TEAM_LEAD' as any;
                                managedOrgUnitId = team.id;
                            }
                        }
                    }

                    const resolvedUserType =
                        role === "INDIVIDUAL" || (role as string) === "STUDENT"
                            ? (role as "INDIVIDUAL" | "STUDENT")
                            : ((user as any).userType || "TENANT");

                    const isB2C = role === "INDIVIDUAL" || (role as string) === "STUDENT" || member?.type === "INDIVIDUAL";
                    // Use member.tenantId when available - app routes use Tenant id, User.clientId is Client id (can differ)
                    const resolvedClientId = isB2C ? null : (member?.tenantId ?? user.clientId ?? null);
                    const resolvedTenantSlug = isB2C ? null : tenantSlug;

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: role,
                        userType: resolvedUserType,
                        clientId: resolvedClientId,
                        tenantId: resolvedClientId,
                        tenantSlug: resolvedTenantSlug,
                        managedOrgUnitId: managedOrgUnitId
                    };
                } catch (error: any) {
                    console.error("[AUTH] Authorize Error:", error.message);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").User; trigger?: "update" | "refetch"; session?: import("next-auth").Session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.userType = (user as any).userType;
                token.clientId = (user as any).clientId;
                token.tenantId = (user as any).tenantId ?? (user as any).clientId;
                token.tenantSlug = (user as any).tenantSlug;
                token.managedOrgUnitId = (user as any).managedOrgUnitId;
            }

            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            return token;
        },
        async session(params: { session: { user?: Record<string, unknown> }; token: Record<string, unknown>; user?: unknown; newSession?: unknown; trigger?: string }) {
            const { session, token } = params;
            if (session?.user && token) {
                const t = token as Record<string, unknown>;
                (session.user as Record<string, unknown>).id = t.id;
                (session.user as Record<string, unknown>).role = t.role;
                (session.user as Record<string, unknown>).userType = t.userType;
                (session.user as Record<string, unknown>).clientId = t.clientId;
                (session.user as Record<string, unknown>).tenantId = t.tenantId ?? t.clientId;
                (session.user as Record<string, unknown>).tenantSlug = t.tenantSlug;
                (session.user as Record<string, unknown>).managedOrgUnitId = t.managedOrgUnitId;
            }
            return session as import("next-auth").Session;
        },
        // AUTHENTICATION_ARCHITECTURE: Respect callbackUrl so login redirects to correct route.
        // Always return path-only for same-origin URLs to prevent full URLs in callbackUrl param
        // (which causes login page to show with callbackUrl=http://... in address bar and redirect loops).
        async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
            const base = baseUrl.replace(/\/$/, "");
            // Path-only input: return as-is (path-only) so callbackUrl param stays path-only
            if (url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/http")) {
                return url;
            }
            // Full URL same-origin: extract pathname so we never proliferate full URLs
            try {
                const parsed = new URL(url.startsWith("http") ? url : `${base}${url}`);
                if (parsed.origin === new URL(baseUrl).origin) {
                    return `${parsed.pathname}${parsed.search}`;
                }
            } catch {
                /* fall through */
            }
            // Malformed or cross-origin: fallback to assessments home
            return "/assessments";
        },
    },
};
