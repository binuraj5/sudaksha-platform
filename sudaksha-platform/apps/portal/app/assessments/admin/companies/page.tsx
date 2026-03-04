"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Users, FolderKanban, ExternalLink, Mail, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { GraduationCap, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CompaniesPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [newClient, setNewClient] = useState({
        name: "",
        email: "",
        slug: "",
        type: "CORPORATE" as "CORPORATE" | "INSTITUTION"
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/admin/clients");
            const data = await res.json();
            if (res.ok) {
                setClients(data);
            } else {
                toast.error(data.error || "Failed to fetch clients");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const res = await fetch("/api/admin/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClient)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Company created successfully");
                setIsCreateOpen(false);
                setNewClient({ name: "", email: "", slug: "", type: "CORPORATE" });
                fetchClients();
            } else {
                toast.error(data.error || "Failed to create company");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 lowercase">Tenant <span className="text-indigo-600">Management</span></h1>
                    <p className="text-slate-500 font-medium italic">Manage corporate clients and educational institutions on the SudAssess platform.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black italic h-12 px-8 shadow-lg shadow-indigo-100">
                            <Plus className="mr-2 h-4 w-4" />
                            Register New Tenant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Register New Company</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="c-name">Company Name</Label>
                                <Input
                                    id="c-name"
                                    required
                                    value={newClient.name}
                                    onChange={e => {
                                        const name = e.target.value;
                                        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                        setNewClient({ ...newClient, name, slug });
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="c-email">Admin Email (Unique)</Label>
                                <Input
                                    id="c-email"
                                    type="email"
                                    required
                                    value={newClient.email}
                                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="c-slug" className="font-bold italic text-slate-700">URL Slug (/clients/slug)</Label>
                                <Input
                                    id="c-slug"
                                    required
                                    className="rounded-xl border-slate-100"
                                    value={newClient.slug}
                                    onChange={e => setNewClient({ ...newClient, slug: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 font-medium italic">Used for the access link: /clients/{newClient.slug || 'slug'}</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold italic text-slate-700">Tenant Type</Label>
                                <Select
                                    value={newClient.type}
                                    onValueChange={(val: any) => setNewClient({ ...newClient, type: val })}
                                >
                                    <SelectTrigger className="rounded-xl border-slate-100 h-10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100">
                                        <SelectItem value="CORPORATE" className="py-2">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                                <span className="font-bold italic">Corporate</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="INSTITUTION" className="py-2">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-indigo-600" />
                                                <span className="font-bold italic">Institution</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" className="rounded-xl font-bold italic" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createLoading} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black italic h-12 px-8 shadow-lg shadow-indigo-100">
                                    {createLoading ? "Creating..." : "Confirm & Register"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border">
                <Search className="h-5 w-5 text-gray-400" />
                <Input
                    placeholder="Search companies by name, email, or slug..."
                    className="border-none focus-visible:ring-0"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No companies found</h3>
                    <p className="mt-1 text-sm text-gray-500">Register a new company to start the B2B flow.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="h-2 bg-red-600" />
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        client.type === "INSTITUTION" ? "bg-teal-50" : "bg-indigo-50"
                                    )}>
                                        {client.type === "INSTITUTION" ? (
                                            <GraduationCap className="h-5 w-5 text-teal-600" />
                                        ) : (
                                            <Briefcase className="h-5 w-5 text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={cn(
                                            "rounded-lg font-black italic lowercase tracking-tight",
                                            client.type === "INSTITUTION" ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
                                        )}>
                                            {client.type}
                                        </Badge>
                                        <Badge variant={client.isActive ? "default" : "secondary"} className="rounded-lg font-black italic lowercase tracking-tight">
                                            {client.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <CardTitle className="mt-4 text-xl font-black italic tracking-tighter text-slate-800 lowercase">{client.name}</CardTitle>
                                <div className="flex items-center text-xs text-slate-400 font-bold italic mt-1">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {client.email}
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">Employees</div>
                                        <div className="flex items-center gap-1 font-semibold text-gray-700">
                                            <Users className="h-3 w-3" />
                                            {client._count.users}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">Projects</div>
                                        <div className="flex items-center gap-1 font-semibold text-gray-700">
                                            <FolderKanban className="h-3 w-3" />
                                            {client._count.projects}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-[10px] text-gray-400 font-mono bg-gray-50 p-1 px-2 rounded">
                                    ID: {client.id}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50 border-t flex flex-wrap gap-2 p-3">
                                <Button asChild variant="default" className="flex-1 bg-red-600 hover:bg-red-700 text-[10px] h-7 px-2">
                                    <Link href={`/assessments/clients/${client.id}/dashboard`} target="_blank">
                                        SuperAdmin View
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1 text-[10px] h-7 px-2 border-red-200 text-red-700 hover:bg-red-50">
                                    <Link href={`/assessments/login?callbackUrl=${encodeURIComponent(`/assessments/clients/${client.id}/dashboard`)}`} target="_blank">
                                        Client Login
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" className="flex-1 text-[10px] h-7 px-2">
                                    <Link href={`/assessments/clients/${client.id}/projects`} target="_blank">
                                        Projects
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
