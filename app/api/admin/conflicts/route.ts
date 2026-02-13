import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        if (!prisma || !('courseBatch' in prisma)) {
            return NextResponse.json({ success: false, error: 'Database not available' }, { status: 500 });
        }

        // Fetch all active/upcoming batches with their trainers
        const batches = await prisma.courseBatch.findMany({
            where: {
                status: { in: ['UPCOMING', 'ONGOING'] }
            },
            include: {
                trainer: {
                    select: { id: true, name: true }
                },
                course: {
                    select: { name: true }
                }
            }
        });

        const conflicts: any[] = [];

        // Simple conflict detection logic
        // 1. Group batches by trainer
        const trainerBatches: Record<string, typeof batches> = {};
        batches.forEach(batch => {
            if (!trainerBatches[batch.trainerId]) {
                trainerBatches[batch.trainerId] = [];
            }
            trainerBatches[batch.trainerId].push(batch);
        });

        // 2. Check for overlaps within each trainer's batches
        Object.keys(trainerBatches).forEach(trainerId => {
            const tBatches = trainerBatches[trainerId];
            for (let i = 0; i < tBatches.length; i++) {
                for (let j = i + 1; j < tBatches.length; j++) {
                    const b1 = tBatches[i];
                    const b2 = tBatches[j];

                    // Check if date ranges overlap
                    const overlap = b1.startDate <= b2.endDate && b2.startDate <= b1.endDate;

                    if (overlap) {
                        // Check if schedules might overlap (simple string check for now)
                        // A more robust check would parse the schedule string "Mon-Wed-Fri 6PM-8PM"
                        const scheduleOverlap = b1.schedule === b2.schedule ||
                            (b1.schedule.includes('6PM-8PM') && b2.schedule.includes('6PM-8PM'));

                        if (scheduleOverlap) {
                            conflicts.push({
                                id: `conflict-${b1.id}-${b2.id}`,
                                trainerId: b1.trainer.id,
                                trainerName: b1.trainer.name,
                                batch1Id: b1.id,
                                batch1Name: b1.name,
                                batch2Id: b2.id,
                                batch2Name: b2.name,
                                type: 'Schedule Overlap',
                                severity: 'High',
                                status: 'Unresolved',
                                description: `Trainer ${b1.trainer.name} has overlapping batches: "${b1.name}" and "${b2.name}" at ${b1.schedule}.`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            conflicts
        });
    } catch (error) {
        console.error('Conflict API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to detect conflicts' },
            { status: 500 }
        );
    }
}
