import { DepartmentSettings } from "@/components/Departments/DepartmentSettings";

export default async function DepartmentSettingsPage({ params }: { params: Promise<{ clientId: string; deptId: string }> }) {
    const { clientId, deptId } = await params;
    return (
        <div className="p-8">
            <DepartmentSettings clientId={clientId} deptId={deptId} />
        </div>
    );
}
