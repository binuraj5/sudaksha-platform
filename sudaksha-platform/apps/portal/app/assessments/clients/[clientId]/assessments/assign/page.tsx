import { redirect } from "next/navigation";

export default async function AssignAssessmentsRedirect({
    params,
}: {
    params: Promise<{ clientId: string }>;
}) {
    const { clientId } = await params;
    redirect(`/assessments/clients/${clientId}/assessments`);
}
