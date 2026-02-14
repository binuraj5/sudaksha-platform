import { prisma } from "@/lib/prisma";

/**
 * Resolves the effective User.id for createdBy fields.
 * Session may come from AdminUser or Member (not in User table).
 * ComponentLibrary and similar tables require User.id.
 */
export async function resolveCreatedByUserId(session: {
    user?: { id?: string; email?: string };
}): Promise<string> {
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
        throw new Error("Session invalid: missing user id and email");
    }

    if (userId) {
        const existing = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });
        if (existing) return existing.id;
    }

    if (userEmail) {
        const byEmail = await prisma.user.findFirst({
            where: { email: { equals: userEmail, mode: "insensitive" } },
            select: { id: true },
        });
        if (byEmail) return byEmail.id;
    }

    const fallback = await prisma.user.findFirst({
        where: {
            email: {
                in: [
                    "system@sudaksha.com",
                    "admin@sudaksha.com",
                    "superadmin@sudaksha.com",
                ],
            },
        },
        select: { id: true },
    });
    if (fallback) return fallback.id;

    throw new Error(
        "No valid User found for createdBy. Admin/Member accounts need a matching User. " +
            "Ensure a User exists with email " +
            (userEmail || "system@sudaksha.com") +
            " or run seed-assessments."
    );
}
