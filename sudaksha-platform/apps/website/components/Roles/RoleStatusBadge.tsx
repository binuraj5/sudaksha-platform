import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, FileEdit, Globe, Lock } from "lucide-react";

export function RoleStatusBadge({ status, visibility }: { status: string, visibility: string }) {
    if (visibility === 'UNIVERSAL') {
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100"><Globe className="w-3 h-3 mr-1" /> Global</Badge>;
    }

    switch (status) {
        case 'APPROVED':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
        case 'PENDING':
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        case 'REJECTED':
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
        case 'DRAFT':
            return <Badge variant="outline" className="text-gray-500"><FileEdit className="w-3 h-3 mr-1" /> Draft</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
