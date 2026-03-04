'use server';

import { prisma } from '@/lib/prisma';
import { trackEvent } from './tracking';

export type CommunicationType = 'CONTACT_FORM' | 'ENROLLMENT_INQUIRY' | 'LIVE_CHAT' | 'NEWSLETTER' | 'OTHER';

interface SubmitInquiryParams {
    type: CommunicationType;
    name: string;
    email: string;
    message: string;
    phone?: string;
    subject?: string;
    metadata?: any;
}

export async function submitInquiry(data: SubmitInquiryParams) {
    try {
        // 1. Create Communication Record
        const communication = await prisma.communication.create({
            data: {
                type: data.type,
                name: data.name,
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                message: data.message,
                metadata: data.metadata,
                status: 'PENDING'
            }
        });

        // 2. Track Audit Event
        await trackEvent({
            action: 'SUBMIT_FORM',
            entityType: 'FORM',
            entityId: communication.id,
            details: {
                formType: data.type,
                email: data.email
            }
        });

        return { success: true, id: communication.id };
    } catch (error) {
        console.error('Failed to submit inquiry:', error);
        await trackEvent({
            action: 'ERROR',
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                context: 'submitInquiry',
                data
            }
        });
        return { success: false, error: 'Failed to submit inquiry' };
    }
}
