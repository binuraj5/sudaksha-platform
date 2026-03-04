import { Metadata } from "next";
import { ModelsPageContent } from "@/components/assessments/ModelsPageContent";

export const metadata: Metadata = {
    title: "Assessment Models | Administration",
    description: "Manage global assessment models",
};

export default function AdminModelsPage() {
    return <ModelsPageContent isAdmin={true} />;
}
