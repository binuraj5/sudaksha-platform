import { ApprovalQueuePage } from "@/components/Approvals/ApprovalQueuePage";

export const metadata = {
    title: "Approval Queue | SudAssess",
    description: "Review pending role and competency creation requests",
};

export default function ApprovalQueueRoute() {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <ApprovalQueuePage />
        </div>
    );
}
