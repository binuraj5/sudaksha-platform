import { CreateRoleWizard } from "@/components/assessments/admin/roles/CreateRoleWizard";

export default function CreateRolePage() {
    return (
        <div className="container mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Define New Role & Competencies</h1>
                <p className="text-slate-500">Create a role and use AI to suggest relevant competencies.</p>
            </div>
            <CreateRoleWizard />
        </div>
    );
}
