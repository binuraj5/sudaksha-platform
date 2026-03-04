declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            tenantId?: string | null;
            clientId?: string | null;
            memberType?: string;
            orgUnitId?: string | null;
            managedOrgUnitId?: string | null;
            departmentId?: string | null;
            teamId?: string | null;
            classId?: string | null;
            employeeId?: string | null;
            accountType?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        role: string;
        tenantId?: string | null;
        clientId?: string | null;
        type?: string;
        orgUnitId?: string | null;
        managedOrgUnitId?: string | null;
        departmentId?: string | null;
        teamId?: string | null;
        classId?: string | null;
        employeeId?: string | null;
        accountType?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        tenantId?: string | null;
        clientId?: string | null;
        type?: string;
        orgUnitId?: string | null;
        managedOrgUnitId?: string | null;
        departmentId?: string | null;
        teamId?: string | null;
        classId?: string | null;
        employeeId?: string | null;
        accountType?: string;
    }
}
