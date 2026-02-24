"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Network, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useTenantLabels } from "@/hooks/useTenantLabels";

interface OrgUnit {
    id: string;
    name: string;
    code: string;
    description?: string;
    manager?: { id: string; name: string; email: string };
    teams?: OrgUnit[];
    isTeam?: boolean;
    memberCount?: number;
}

export function OrgHierarchyView({ tenantId, currentOrgUnitId }: { tenantId: string; currentOrgUnitId?: string }) {
    const labels = useTenantLabels();
    const [departments, setDepartments] = useState<OrgUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchHierarchy() {
            try {
                const [deptsRes, teamsRes] = await Promise.all([
                    fetch(`/api/clients/${tenantId}/departments`),
                    fetch(`/api/clients/${tenantId}/teams`)
                ]);

                if (deptsRes.ok && teamsRes.ok) {
                    const deptsData = await deptsRes.json();
                    const teamsData = await teamsRes.json();

                    // Join teams into their parent departments
                    const deptsWithTeams = deptsData.map((d: any) => ({
                        ...d,
                        isTeam: false,
                        teams: teamsData.filter((t: any) => t.department?.id === d.id).map((t: any) => ({
                            ...t,
                            isTeam: true,
                            memberCount: t.memberCount
                        }))
                    }));
                    setDepartments(deptsWithTeams);

                    // Auto-expand the department containing the user's team
                    const toExpand = new Set<string>();
                    for (const dept of deptsWithTeams) {
                        if (dept.id === currentOrgUnitId) toExpand.add(dept.id);
                        if (dept.teams.some((t: any) => t.id === currentOrgUnitId)) {
                            toExpand.add(dept.id);
                        }
                    }
                    if (toExpand.size > 0) setExpandedDepts(toExpand);
                } else {
                    toast.error("Failed to load organization hierarchy");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred loading the hierarchy");
            } finally {
                setLoading(false);
            }
        }

        if (tenantId) fetchHierarchy();
    }, [tenantId, currentOrgUnitId]);

    const toggleExpand = (deptId: string) => {
        setExpandedDepts(prev => {
            const next = new Set(prev);
            if (next.has(deptId)) next.delete(deptId);
            else next.add(deptId);
            return next;
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading your {labels.orgUnitPlural.toLowerCase()}...</p>
            </div>
        );
    }

    if (departments.length === 0) {
        return (
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Network className="h-14 w-14 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">No organizational data</h2>
                    <p className="text-gray-500 max-w-md mt-2">
                        Your organization structure hasn't been configured yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 pt-4">
            {departments.map(dept => {
                const isExpanded = expandedDepts.has(dept.id);
                const isMyDept = dept.id === currentOrgUnitId || dept.teams?.some(t => t.id === currentOrgUnitId);

                return (
                    <Card key={dept.id} className={`border border-gray-100 shadow-sm transition-all ${isMyDept ? 'ring-1 ring-indigo-500 border-indigo-200' : ''}`}>
                        <div
                            className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-gray-50 border-b border-gray-100' : ''}`}
                            onClick={() => toggleExpand(dept.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isMyDept ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Network className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-semibold ${isMyDept ? 'text-indigo-900' : 'text-gray-900'}`}>{dept.name}</h3>
                                        {isMyDept && <Badge className="bg-indigo-50 text-indigo-700 border-none text-[10px] uppercase font-bold px-1.5 py-0">My {labels.orgUnit}</Badge>}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Head: {dept.manager?.name || "Unassigned"} • {dept.teams?.length || 0} {labels.subUnitPlural.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-gray-400">
                                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </div>
                        </div>

                        {isExpanded && dept.teams && dept.teams.length > 0 && (
                            <div className="p-4 bg-white">
                                <div className="space-y-2 pl-6 ml-4 border-l-2 border-gray-100">
                                    {dept.teams.map(team => {
                                        const isMyTeam = team.id === currentOrgUnitId;
                                        return (
                                            <div key={team.id} className={`relative flex items-center gap-3 p-3 rounded-lg border ${isMyTeam ? 'bg-indigo-50 border-indigo-200' : 'border-gray-100 hover:border-gray-200'}`}>
                                                <div className="absolute -left-[27px] top-1/2 w-6 h-[2px] bg-gray-100" />
                                                <div className={`h-8 w-8 rounded-full border ${isMyTeam ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400'} flex items-center justify-center shrink-0 z-10`}>
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-medium ${isMyTeam ? 'text-indigo-900' : 'text-gray-900'}`}>{team.name}</p>
                                                            {isMyTeam && <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200 uppercase tracking-widest bg-white">My {labels.subUnit}</Badge>}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Lead: {team.manager?.name || "Unassigned"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {team.memberCount || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {isExpanded && (!dept.teams || dept.teams.length === 0) && (
                            <div className="p-4 bg-white text-center text-sm text-gray-500">
                                No {labels.subUnitPlural.toLowerCase()} in this {labels.orgUnit.toLowerCase()} yet.
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}
