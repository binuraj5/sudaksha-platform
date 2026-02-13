import { redirect } from "next/navigation";

export default async function ModelPage({
    params,
}: {
    params: Promise<{ modelId: string }>;
}) {
    const { modelId } = await params;
    redirect(`/assessments/admin/models/${modelId}/questions`);
}
