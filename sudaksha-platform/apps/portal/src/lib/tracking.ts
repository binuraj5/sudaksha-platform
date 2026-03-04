'use server';

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

type AuditAction = 'CLICK_CTA' | 'SUBMIT_FORM' | 'VIEW_PAGE' | 'LOGIN' | 'LOGOUT' | 'ERROR' | 'LIVE_CHAT';
type EntityType = 'COURSE' | 'BUTTON' | 'FORM' | 'PAGE' | 'USER';

interface TrackEventParams {
    action: AuditAction;
    entityType?: EntityType;
    entityId?: string;
    details?: any;
    userId?: string;
}

export async function trackEvent({
    action,
    entityType,
    entityId,
    details,
    userId
}: TrackEventParams) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                details: details || {},
                ipAddress,
                userAgent,
                userId
            }
        });
    } catch (error) {
        console.error('Failed to track event:', error);
        // Don't throw, tracking should be non-blocking
    }
}
