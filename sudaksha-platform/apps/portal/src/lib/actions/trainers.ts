'use server';

import { prisma as db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTrainer(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const bio = formData.get('bio') as string;
        const expertise = formData.get('expertise') as string; // JSON string or comma-sep
        const linkedinUrl = formData.get('linkedinUrl') as string;
        const experience = formData.get('experience') ? parseInt(formData.get('experience') as string) : 1;

        if (!name || !email) {
            console.error("❌ Validation Failed: Name and Email required");
            throw new Error('Name and Email are required');
        }

        // Parse expertise (assuming line-separated or comma-separated for simple MVP)
        const expertiseArray = expertise ? expertise.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

        console.log("🛠️ Creating Trainer:", { name, email, expertiseArray });

        await db.trainer.create({
            data: {
                name,
                email,
                bio: bio || '',
                expertise: expertiseArray, // Stored as Json
                experience: experience,
                linkedinUrl: linkedinUrl || null,
                isPublished: false, // Default to unpublished
                status: 'ACTIVE'
            }
        });
    } catch (e) {
        console.error("❌ Error creating trainer:", e);
        return { success: false, error: (e as Error).message };
    }
    revalidatePath('/admin/trainers');
    redirect('/admin/trainers');
}

export async function updateTrainer(id: string, formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const bio = formData.get('bio') as string;
        const expertise = formData.get('expertise') as string;
        const linkedinUrl = formData.get('linkedinUrl') as string;
        const experience = formData.get('experience') ? parseInt(formData.get('experience') as string) : 1;

        const expertiseArray = expertise ? expertise.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

        await db.trainer.update({
            where: { id },
            data: {
                name,
                email,
                bio: bio || '',
                expertise: expertiseArray,
                experience,
                linkedinUrl: linkedinUrl || null,
            }
        });
    } catch (e) {
        console.error("❌ Error updating trainer:", e);
        return { success: false, error: (e as Error).message };
    }
    revalidatePath('/admin/trainers');
    redirect('/admin/trainers');
}

export async function toggleTrainerStatus(id: string, currentStatus: boolean) {
    await db.trainer.update({
        where: { id },
        data: { isPublished: !currentStatus }
    });
    revalidatePath('/admin/trainers');
}

export async function deleteTrainer(id: string) {
    console.log("🗑️ Deleting Trainer:", id);
    await db.trainer.delete({
        where: { id }
    });
    revalidatePath('/admin/trainers');
}

export async function getTrainers() {
    return await db.trainer.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getTrainerById(id: string) {
    return await db.trainer.findUnique({
        where: { id }
    });
}
