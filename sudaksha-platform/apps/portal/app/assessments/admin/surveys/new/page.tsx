
import { SurveyBuilder } from "@/components/Surveys/SurveyBuilder";
import { ClipboardList } from "lucide-react";

export default function NewSurveyPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Survey Builder</h2>
                    <p className="text-muted-foreground">Create behavioral or feedback questionnaires</p>
                </div>
            </div>

            <SurveyBuilder />
        </div>
    );
}
