
import { SurveyPlayer } from "@/components/Surveys/SurveyPlayer";

export default function SurveyPage({ params }: { params: { id: string } }) {
    return (
        <div className="bg-slate-50 min-h-screen">
            <SurveyPlayer id={params.id} />
        </div>
    );
}
