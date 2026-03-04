"use client";

import React, { useEffect, useState, use } from "react";
import {
    User, Users, Building, ArrowDown, ChevronRight,
    ShieldCheck, GraduationCap, Briefcase, Loader2,
    Network, Mail, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MemberNode {
    id: string;
    name: string;
    avatar: string | null;
    designation: string | null;
    email: string;
}

interface HierarchyData {
    me: MemberNode & { role: string; type: string };
    manager: MemberNode | null;
    directReports: MemberNode[];
    peers: MemberNode[];
    orgUnit: {
        id: string;
        name: string;
        type: string;
        parent: { id: string; name: string; type: string } | null;
    } | null;
    managedUnits: Array<{ id: string; name: string; type: string }>;
}

export default function ClientHierarchyPage({
    params,
}: {
    params: Promise<{ clientId: string }>;
}) {
    const { clientId } = use(params);
    const [data, setData] = useState<HierarchyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/clients/${clientId}/hierarchy`)
            .then(res => res.json())
            .then(payload => {
                if (payload.me) setData(payload);
            })
            .finally(() => setLoading(false));
    }, [clientId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium italic">Mapping your organizational universe...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Network className="h-8 h-8 text-slate-400" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Structure Not Found</h1>
                <p className="text-slate-500 italic">We couldn't find your organizational structure. Contact your admin to ensure your profile is linked correctly.</p>
            </div>
        );
    }

    const MemberCard = ({ member, label, highlight = false, isMe = false }: { member: MemberNode; label: string; highlight?: boolean; isMe?: boolean }) => (
        <Card className={`relative group transition-all duration-300 ${highlight ? 'border-2 border-indigo-500 bg-indigo-50/50 shadow-xl scale-105 z-10' : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg'}`}>
            {isMe && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-white px-3 py-0.5">YOU</Badge>
                </div>
            )}
            <CardContent className="p-5 flex items-center gap-4">
                <div className="relative">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold overflow-hidden shadow-inner ${highlight ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                            member.name.charAt(0)
                        )}
                    </div>
                    {highlight && <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                    <h3 className={`font-bold truncate ${highlight ? 'text-indigo-900' : 'text-slate-900'}`}>{member.name}</h3>
                    <p className="text-sm text-slate-500 truncate italic">{member.designation || "No Title"}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <a href={`mailto:${member.email}`} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                        <Mail className="h-4 w-4" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );

    const Connector = () => (
        <div className="flex justify-center h-12">
            <div className="w-0.5 bg-gradient-to-b from-indigo-200 to-indigo-500"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Network className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 lowercase italic">My <span className="text-indigo-600 font-serif not-italic">Hierarchy</span></h1>
                    </div>
                    <p className="text-slate-500 italic font-medium">Visualization of your reporting chain and team context.</p>
                </div>

                <div className="flex items-center gap-4">
                    {data.orgUnit && (
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Current Unit</p>
                            <p className="text-slate-900 font-bold">{data.orgUnit.name}</p>
                            {data.orgUnit.parent && <p className="text-xs text-indigo-600 font-bold tracking-tight">{data.orgUnit.parent.name}</p>}
                        </div>
                    )}
                    <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-600 font-black italic rounded-xl px-4 py-2">
                        {data.me.type.replace('_', ' ')}
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Hierarchy Flow */}
                <div className="lg:col-span-8 flex flex-col items-center">

                    {/* MANAGER */}
                    {data.manager ? (
                        <div className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-500">
                            <MemberCard member={data.manager} label="Reporting To" />
                            <Connector />
                        </div>
                    ) : (
                        <div className="w-full max-w-md p-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-center mb-6">
                            <p className="text-slate-400 font-bold italic text-sm">No Reporting Manager Assigned</p>
                        </div>
                    )}

                    {/* SELF */}
                    <div className="w-full max-w-md animate-in fade-in duration-700 delay-200">
                        <MemberCard member={data.me} label="Current Profile" highlight isMe />
                        {(data.directReports.length > 0) && <Connector />}
                    </div>

                    {/* DIRECT REPORTS */}
                    {data.directReports.length > 0 && (
                        <div className="w-full max-w-3xl mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div className="col-span-full text-center mb-2">
                                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Direct Reports ({data.directReports.length})</p>
                            </div>
                            {data.directReports.map(report => (
                                <MemberCard key={report.id} member={report} label="Direct Report" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Side Context: Peers & Org Units */}
                <div className="lg:col-span-4 space-y-8">

                    {/* PEERS Section */}
                    <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg font-black italic tracking-tight lowercase">Team <span className="text-indigo-600 font-serif not-italic">Peers</span></CardTitle>
                            <CardDescription className="text-xs font-medium italic">Members in your same unit or reporting group.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                                {data.peers.length > 0 ? data.peers.map(peer => (
                                    <div key={peer.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-default group">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                            {peer.avatar ? <img src={peer.avatar} className="h-full w-full object-cover rounded-xl" /> : peer.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-slate-900 truncate leading-tight">{peer.name}</p>
                                            <p className="text-[11px] text-slate-400 truncate italic">{peer.designation || "Team Member"}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                )) : (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-400 text-sm font-medium italic">No peers found in this unit.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* MANAGED UNITS (If Manager) */}
                    {data.managedUnits.length > 0 && (
                        <Card className="rounded-[2rem] border-none shadow-xl bg-indigo-600 text-white overflow-hidden">
                            <CardHeader className="border-b border-indigo-500/50">
                                <CardTitle className="text-lg font-black italic tracking-tight lowercase text-white">Managed <span className="text-indigo-300 font-serif not-italic">Units</span></CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {data.managedUnits.map(unit => (
                                    <div key={unit.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
                                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Building className="h-5 w-5 text-indigo-100" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-tight">{unit.name}</p>
                                            <p className="text-[11px] text-indigo-200 font-bold uppercase tracking-wider">{unit.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
