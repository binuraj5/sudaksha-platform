"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Briefcase, UsersIcon } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkUploadEmployeesDialog } from "@/components/BulkUploadEmployeesDialog";
import { useTenantLabels } from "@/hooks/useTenantLabels";

const basePath = (slug: string) => `/assessments/org/${slug}`;

interface CorporateDepartmentDetailContentProps {
  slug: string;
  clientId: string;
  deptId: string;
  department: {
    id: string;
    name: string;
    code: string;
    description?: string;
    manager?: { id: string; name: string; email?: string; avatar?: string };
    classCount: number;
    memberCount: number;
  };
}

interface Team {
  id: string;
  name: string;
  code: string;
  memberCount: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  memberCode: string;
  type: string;
  role: string;
  orgUnit: { id: string; name: string; code: string; type: string } | null;
}

export function CorporateDepartmentDetailContent({
  slug,
  clientId,
  deptId,
  department,
}: CorporateDepartmentDetailContentProps) {
  const labels = useTenantLabels();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [teamsRefresh, setTeamsRefresh] = useState(0);
  const [membersRefresh, setMembersRefresh] = useState(0);
  const [membersFilterRole, setMembersFilterRole] = useState<string>("all");
  const [membersFilterTeamId, setMembersFilterTeamId] = useState<string>("all");
  const [uploadEmployeesOpen, setUploadEmployeesOpen] = useState(false);

  useEffect(() => {
    setLoadingTeams(true);
    fetch(`/api/org/${slug}/departments/${deptId}/teams`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoadingTeams(false));
  }, [slug, deptId, teamsRefresh]);

  useEffect(() => {
    setLoadingMembers(true);
    const params = new URLSearchParams();
    if (membersFilterRole !== "all") params.set("role", membersFilterRole);
    if (membersFilterTeamId !== "all") params.set("teamId", membersFilterTeamId);
    const qs = params.toString();
    fetch(`/api/org/${slug}/departments/${deptId}/members${qs ? `?${qs}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }, [slug, deptId, membersRefresh, membersFilterRole, membersFilterTeamId]);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: labels.orgUnitPlural, href: basePath(slug) + "/departments" },
          { label: department.name },
        ]}
        className="mb-2"
      />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={basePath(slug) + "/departments"}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{department.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">{department.code}</p>
          {department.manager && (
            <p className="text-sm text-muted-foreground mt-1">
              Head: {department.manager.name}
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">{labels.subUnitPlural}</TabsTrigger>
          <TabsTrigger value="members">{labels.memberPlural}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{labels.subUnitPlural}</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{department.classCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{labels.memberPlural}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{department.memberCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{labels.activityPlural}</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">—</div>
              </CardContent>
            </Card>
          </div>
          {department.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{department.description}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <h3 className="text-lg font-semibold">{labels.subUnitPlural} in this {labels.orgUnit}</h3>
          {loadingTeams ? (
            <p className="text-sm text-muted-foreground">Loading {labels.subUnitPlural.toLowerCase()}…</p>
          ) : teams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No {labels.subUnitPlural.toLowerCase()} yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card key={team.id}>
                  <CardContent className="py-4">
                    <span className="font-medium">{team.name}</span>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{team.code || ""}</p>
                    <Badge variant="outline" className="mt-2">
                      {team.memberCount} {labels.memberPlural.toLowerCase()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-lg font-semibold">{labels.memberPlural}</h3>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href={basePath(slug) + "/employees/new?departmentId=" + deptId}>
                  Add {labels.member}
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setUploadEmployeesOpen(true)}>
                Upload {labels.memberPlural}
              </Button>
              <BulkUploadEmployeesDialog
                clientId={clientId}
                open={uploadEmployeesOpen}
                onOpenChange={setUploadEmployeesOpen}
                onSuccess={() => setMembersRefresh((k) => k + 1)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-end rounded-lg border p-4 bg-muted/30">
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Select value={membersFilterRole} onValueChange={setMembersFilterRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ASSESSOR">{labels.member}</SelectItem>
                  <SelectItem value="TEAM_LEAD">{labels.subUnitLead}</SelectItem>
                  <SelectItem value="DEPT_HEAD">{labels.orgUnit} Head</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{labels.subUnit}</Label>
              <Select value={membersFilterTeamId} onValueChange={setMembersFilterTeamId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`All ${labels.subUnitPlural.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {labels.subUnitPlural.toLowerCase()}</SelectItem>
                  <SelectItem value={deptId}>Direct ({department.name})</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {loadingMembers ? (
            <p className="text-sm text-muted-foreground">Loading {labels.memberPlural.toLowerCase()}…</p>
          ) : members.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No {labels.memberPlural.toLowerCase()} in this {labels.orgUnit.toLowerCase()}.{" "}
                <Link href={basePath(slug) + "/employees/new?departmentId=" + deptId} className="text-primary hover:underline">
                  Add a {labels.member.toLowerCase()}
                </Link>{" "}
                or use bulk upload.
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>{labels.memberCode}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>{labels.subUnit}</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="font-mono text-sm">{m.memberCode ?? "—"}</TableCell>
                      <TableCell className="text-sm">{m.email}</TableCell>
                      <TableCell className="text-sm">{m.orgUnit?.name ?? "—"}</TableCell>
                      <TableCell className="text-sm">{m.role}</TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-8 px-2" asChild>
                          <Link href={basePath(slug) + "/employees?dept=" + deptId}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
