import { prisma } from "@/lib/prisma";
import OfflineBatchForm from '@/components/admin/OfflineBatchForm';
import { notFound } from "next/navigation";

export default async function EditOfflineBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await prisma.offlineBatch.findUnique({
    where: { id }
  });

  if (!batch) return notFound();

  // Serialize Decimal and Date objects for client component
  const serializedBatch = {
    ...batch,
    satisfactionScore: batch.satisfactionScore ? batch.satisfactionScore.toString() : null,
    startDate: batch.startDate ? batch.startDate.toISOString() : null,
    endDate: batch.endDate ? batch.endDate.toISOString() : null,
    createdAt: batch.createdAt?.toISOString(),
    updatedAt: batch.updatedAt?.toISOString(),
  };

  return <OfflineBatchForm initialData={serializedBatch} mode="edit" />;
}
