
import { SurveyAnalytics } from "@/components/Surveys/SurveyAnalytics";
import { BarChart3 } from "lucide-react";

export default function SurveyAnalyticsPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Survey Analytics</h2>
                    <p className="text-muted-foreground">Detailed insights and sentiment analysis</p>
                </div>
            </div>

            <SurveyAnalytics id={params.id} />
        </div>
    );
}
