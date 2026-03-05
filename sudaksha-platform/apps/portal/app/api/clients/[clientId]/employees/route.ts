import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/get-session";
import { v4 as uuidv4 } from "uuid";
import { invitationEmailTemplate } from "@/lib/email-templates/invitation";
import { sendEmail } from "@/lib/email";
import { hash } from "bcryptjs";
import { validateStudentOrgUnit } from "@/lib/services/class-service";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const allowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD'];
    if (!session || !allowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const deptId = searchParams.get('dept');
    const status = searchParams.get('status');
    const simple = searchParams.get('simple') === 'true';
    const typeParam = searchParams.get('type');

    try {
        // Polymorphic: INSTITUTION = Students by default, CORPORATE = Employees. ?type=EMPLOYEE returns faculty for institutions.
        const tenant = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: { type: true }
        });
        const tenantType = (tenant?.type as 'CORPORATE' | 'INSTITUTION') || 'CORPORATE';
        let memberType: string = tenantType === 'INSTITUTION' ? 'STUDENT' : 'EMPLOYEE';
        if (typeParam === 'EMPLOYEE' || typeParam === 'employee') memberType = 'EMPLOYEE';
        if (typeParam === 'STUDENT' || typeParam === 'student') memberType = 'STUDENT';

        const whereClause: any = {
            tenantId: clientId,
            type: memberType
        };

        // Scope for Department Head (DEPT_HEAD = DEPARTMENT_HEAD)
        if (session.user.role === 'DEPARTMENT_HEAD' || session.user.role === 'DEPT_HEAD') {
            if (!session.user.managedOrgUnitId) return NextResponse.json({ error: "Department Head without Unit" }, { status: 403 });
            whereClause.orgUnitId = session.user.managedOrgUnitId;
        }

        // Scope for Team Lead
        if (session.user.role === 'TEAM_LEAD') {
            if (!session.user.managedOrgUnitId) return NextResponse.json({ error: "Team Lead without Unit" }, { status: 403 });
            whereClause.orgUnitId = session.user.managedOrgUnitId; // Assuming Team is an OrgUnit and members are assigned to it
        }

        if (status && status !== 'all') {
            if (status === 'active') whereClause.isActive = true;
            if (status === 'inactive') whereClause.isActive = false;
        }

        if (deptId && session.user.role !== 'DEPARTMENT_HEAD' && session.user.role !== 'DEPT_HEAD' && session.user.role !== 'TEAM_LEAD') {
            // Only allow filtering by dept if not already scoped
            whereClause.orgUnitId = deptId;
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { memberCode: { contains: search, mode: 'insensitive' } },
                ...(tenantType === 'INSTITUTION' ? [{ enrollmentNumber: { contains: search, mode: 'insensitive' } }] : [{ employeeId: { contains: search, mode: 'insensitive' } }]),
            ];
        }

        if (simple) {
            const employees = await prisma.member.findMany({
                where: { ...whereClause, isActive: true },
                select: { id: true, name: true, email: true, employeeId: true, enrollmentNumber: true, memberCode: true },
                orderBy: { name: 'asc' }
            });
            return NextResponse.json(employees);
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            prisma.member.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    orgUnit: true,
                    reportingManager: { select: { id: true, name: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.member.count({ where: whereClause })
        ]);

        return NextResponse.json({
            data: employees,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Employees GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ clientId: string }> }
) {
    const session = await getApiSession();
    const { clientId } = await params;

    const postAllowedRoles = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CLIENT_ADMIN', 'DEPARTMENT_HEAD', 'DEPT_HEAD', 'TEAM_LEAD', 'CLASS_TEACHER'];
    if (!session || !postAllowedRoles.includes(session.user.role as string)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { firstName, lastName, email, phone, designation, orgUnitId, reportingToId, enrollmentNumber, type: bodyType, role: bodyRole, facultyType: bodyFacultyType, memberCode } = body;

        const tenantInfo = await prisma.tenant.findUnique({
            where: { id: clientId },
            select: { type: true, name: true },
        });
        const tenantType = (tenantInfo?.type as 'CORPORATE' | 'INSTITUTION') || 'CORPORATE';
        let memberType: 'STUDENT' | 'EMPLOYEE';
        if (bodyType === 'EMPLOYEE' || bodyType === 'employee') {
            memberType = 'EMPLOYEE';
        } else if (bodyType === 'STUDENT' || bodyType === 'student' || (tenantType === 'INSTITUTION' && orgUnitId)) {
            memberType = 'STUDENT';
        } else {
            memberType = tenantType === 'INSTITUTION' ? 'EMPLOYEE' : 'EMPLOYEE';
        }

        // Force OrgUnit for Dept Head / Team Lead (unless institution student with explicit class)
        let targetOrgUnitId = orgUnitId;
        if (memberType !== 'STUDENT' && (session.user.role === 'DEPARTMENT_HEAD' || session.user.role === 'DEPT_HEAD' || session.user.role === 'TEAM_LEAD')) {
            targetOrgUnitId = session.user.managedOrgUnitId;
            if (!targetOrgUnitId) {
                return NextResponse.json({ error: "Manager configuration error" }, { status: 403 });
            }
        }

        // Institution student: orgUnitId must be a CLASS linked to a course
        if (memberType === 'STUDENT') {
            if (!targetOrgUnitId) {
                return NextResponse.json({ error: "Class (orgUnitId) is required for students" }, { status: 400 });
            }
            const classValidation = await validateStudentOrgUnit(clientId, targetOrgUnitId);
            if (!classValidation.ok) {
                return NextResponse.json({ error: classValidation.error }, { status: 400 });
            }
        }

        // Validation
        if (!email || !firstName) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

        // Check Unique
        const existing = await prisma.member.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

        // Check Unique for ID
        const inputCode = memberCode || enrollmentNumber;
        if (inputCode) {
            const dupCode = await prisma.member.findFirst({
                where: {
                    tenantId: clientId,
                    OR: [
                        { enrollmentNumber: inputCode },
                        { employeeId: inputCode }
                    ]
                }
            });
            if (dupCode) {
                return NextResponse.json({ error: `ID ${inputCode} already exists in this tenant` }, { status: 400 });
            }
        }

        const randomCode = memberType === 'STUDENT'
            ? (inputCode || `STU${Math.floor(1000 + Math.random() * 9000)}`)
            : (inputCode || `EMP${Math.floor(1000 + Math.random() * 9000)}`);

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await hash(tempPassword, 10);
        const invitationToken = uuidv4();

        const defaultRole = memberType === 'STUDENT' ? 'ASSESSOR' : (bodyRole || 'EMPLOYEE');
        // Map UI role names to Prisma MemberRole enum (DB uses DEPT_HEAD, not DEPARTMENT_HEAD)
        const roleMap: Record<string, string> = { DEPARTMENT_HEAD: 'DEPT_HEAD' };
        const dbRole = roleMap[defaultRole] || defaultRole;
        const facultyTypeVal = bodyFacultyType && ['PERMANENT', 'ADJUNCT', 'VISITING'].includes(String(bodyFacultyType)) ? bodyFacultyType : null;
        const newEmployee = await prisma.member.create({
            data: {
                tenantId: clientId,
                type: memberType,
                role: dbRole,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                email,
                phone,
                designation,
                memberCode: randomCode,
                ...(memberType === 'EMPLOYEE' && facultyTypeVal && { facultyType: facultyTypeVal }),
                ...(memberType === 'STUDENT' && { enrollmentNumber: inputCode || randomCode }),
                ...(memberType === 'EMPLOYEE' && { employeeId: inputCode || randomCode }),
                password: hashedPassword,
                orgUnitId: targetOrgUnitId || null,
                reportingToId: reportingToId || null,
                isActive: true,
                status: "PENDING",
                invitationToken,
                invitationSentAt: new Date()
            }
        });

        const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${invitationToken}`;

        await sendEmail(
            email,
            `Invitation to join ${tenantInfo?.name || 'SudAssess'}`,
            invitationEmailTemplate(tenantInfo?.name || 'SudAssess', inviteLink)
        );

        return NextResponse.json(newEmployee);
    } catch (error) {
        console.error("Employee Create Error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        const details = process.env.NODE_ENV === "development" ? message : undefined;
        return NextResponse.json(
            { error: "Internal Server Error", details },
            { status: 500 }
        );
    }
}
