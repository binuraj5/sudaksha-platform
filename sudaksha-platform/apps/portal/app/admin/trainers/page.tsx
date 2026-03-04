import { prisma as db } from '@/lib/prisma';
import TrainersClientPage from '@/components/admin/trainers/TrainersClientPage';

export const dynamic = 'force-dynamic';

export default async function TrainerListPage() {
    try {
        const trainers = await db.trainer.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return <TrainersClientPage initialTrainers={trainers} />;
    } catch (error) {
        console.error("Failed to fetch trainers:", error);
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Trainers</h2>
                <p className="text-gray-600">Please try refreshing the page or contact support.</p>
                <p className="text-xs text-gray-400 mt-4">{String(error)}</p>
            </div>
        );
    }
}
