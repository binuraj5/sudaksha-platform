import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import fs from 'fs';

async function debug() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const u = { email: 'employee@techcorp.com', name: 'Jane Employee', role: 'EMPLOYEE' as any, memberRole: 'ASSESSOR' as any, clientId: 'cml53ispm0000maqc64ub0dsh', type: 'EMPLOYEE' as any };

    try {
        console.log('TRYING USER...');
        await prisma.user.upsert({
            where: { email: u.email },
            update: { password: hashedPassword, role: u.role, clientId: u.clientId, accountType: 'CLIENT_USER' as any },
            create: {
                id: `u_${u.email.replace(/[@.]/g, '_')}`,
                email: u.email,
                password: hashedPassword,
                name: u.name,
                role: u.role,
                clientId: u.clientId,
                accountType: 'CLIENT_USER' as any,
                isActive: true
            }
        });
        console.log('USER OK');

        console.log('TRYING MEMBER...');
        await (prisma.member as any).upsert({
            where: { email: u.email },
            update: { password: hashedPassword, role: u.memberRole, tenantId: u.clientId, type: u.type },
            create: {
                id: `m_${u.email.replace(/[@.]/g, '_')}`,
                email: u.email,
                password: hashedPassword,
                name: u.name,
                role: u.memberRole,
                tenantId: u.clientId,
                type: u.type,
                isActive: true
            }
        });
        console.log('MEMBER OK');
    } catch (err: any) {
        fs.writeFileSync('error_log.txt', err.message);
        console.log('ERROR WRITTEN TO error_log.txt');
    } finally {
        await prisma.$disconnect();
    }
}

debug();
