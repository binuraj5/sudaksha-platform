import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
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
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    console.log(`[AUTH] Attempting login for: ${credentials.email}`);
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    });

                    if (!user) {
                        console.log(`[AUTH] User not found: ${credentials.email}`);
                        return null;
                    }

                    if (!user.password) {
                        console.log(`[AUTH] User has no password: ${credentials.email}`);
                        return null;
                    }

                    // Check for lockout
                    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
                        console.log(`[AUTH] User locked out: ${credentials.email} until ${user.lockoutUntil}`);
                        throw new Error("Account locked. Try again in 15 minutes.");
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        console.log(`[AUTH] Invalid password for: ${credentials.email}`);
                        // Increment failed attempts
                        const newFailedAttempts = (user.failedAttempts || 0) + 1;
                        const updateData: any = { failedAttempts: newFailedAttempts };

                        if (newFailedAttempts >= 5) {
                            updateData.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
                        }

                        await prisma.user.update({
                            where: { id: user.id },
                            data: updateData
                        });

                        return null;
                    }

                    console.log(`[AUTH] Password valid for: ${credentials.email}. Role: ${user.role}`);

                    // Reset failed attempts on success
                    if ((user.failedAttempts || 0) > 0 || user.lockoutUntil) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { failedAttempts: 0, lockoutUntil: null }
                        });
                    }

                    if (!user.isActive) {
                        console.log(`[AUTH] User suspended: ${credentials.email}`);
                        throw new Error("Account execution suspended");
                    }

                    // Check for Member mapping to determine Department Head status
                    const member = await prisma.member.findUnique({
                        where: { email: user.email },
                        include: {
                            managedUnits: {
                                where: { isActive: true },
                                select: { id: true, type: true }
                            }
                        }
                    });

                    let role = user.role;
                    let managedOrgUnitId = null;

                    if (member && member.managedUnits.length > 0) {
                        const dept = member.managedUnits.find(u => u.type === 'DEPARTMENT');
                        if (dept) {
                            role = 'DEPARTMENT_HEAD' as any; // Overriding for session context
                            managedOrgUnitId = dept.id;
                        } else {
                            const team = member.managedUnits.find(u => u.type === 'TEAM');
                            if (team) {
                                role = 'TEAM_LEAD' as any;
                                managedOrgUnitId = team.id;
                            }
                        }
                        console.log(`[AUTH] User has managed units. Role updated to: ${role}`);
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: role,
                        employeeId: user.employeeId || null,
                        accountType: user.accountType || null,
                        clientId: user.clientId || null,
                        managedOrgUnitId: managedOrgUnitId
                    };
                } catch (error) {
                    console.error("[AUTH] Authorize Error:", error);
                    return null;
                }
            },

        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: { token: any, user: any, trigger?: string, session?: any }) {
            try {
                if (user) {
                    token.id = user.id;
                    token.role = user.role;
                    token.employeeId = user.employeeId;
                    token.accountType = user.accountType;
                    token.clientId = user.clientId;
                    token.managedOrgUnitId = user.managedOrgUnitId;
                }

                // Update session trigger
                if (trigger === "update" && session) {
                    return { ...token, ...session.user };
                }

                return token;
            } catch (error) {
                console.error("[AUTH] JWT Callback Error:", error);
                return token;
            }
        },
        async session({ session, token }: { session: any, token: any }) {
            try {
                if (session && session.user && token) {
                    session.user.id = token.id;
                    session.user.role = token.role;
                    session.user.employeeId = token.employeeId;
                    session.user.accountType = token.accountType;
                    session.user.clientId = token.clientId;
                    session.user.managedOrgUnitId = token.managedOrgUnitId;
                }
                return session;
            } catch (error) {
                console.error("[AUTH] Session Callback Error:", error);
                return session;
            }
        },
    },
};
