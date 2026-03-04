
import { AIGenerator } from "@/components/AIGenerator/AIGenerator";
import { Sparkles } from "lucide-react";

export default function AIGeneratorPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Content AI</h2>
                    <p className="text-muted-foreground">Admin Toolbox {">"} Smart Generator</p>
                </div>
            </div>

            <AIGenerator />
        </div>
    );
}
