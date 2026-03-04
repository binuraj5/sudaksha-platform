import { redirect } from "next/navigation";

export default function AdminRoot() {
    redirect("/assessments/admin/dashboard");
}
