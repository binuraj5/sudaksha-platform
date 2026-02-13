
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            clientId?: string | null;
            tenantId?: string | null;
            memberType?: string;
            orgUnitId?: string | null;
            employeeId?: string | null;
            accountType?: string | null;
            managedOrgUnitId?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
        clientId?: string | null;
        tenantId?: string | null;
        memberType?: string;
        orgUnitId?: string | null;
        employeeId?: string | null;
        accountType?: string | null;
        managedOrgUnitId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        clientId?: string | null;
        tenantId?: string | null;
        memberType?: string;
        orgUnitId?: string | null;
        employeeId?: string | null;
        accountType?: string | null;
        managedOrgUnitId?: string | null;
        userType?: string;
        tenantSlug?: string | null;
    }
}
