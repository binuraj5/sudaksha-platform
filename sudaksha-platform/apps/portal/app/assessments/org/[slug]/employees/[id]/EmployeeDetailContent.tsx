"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, Users, Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useTenantLabels } from "@/hooks/useTenantLabels";

const basePath = (slug: string) => `/assessments/org/${slug}`;

interface OrganizationUnit {
  id: string;
  name: string;
  code?: string;
}

interface MemberData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  role: string;
  type: string;
  isActive: boolean;
  employeeId?: string;
  enrollmentNumber?: string;
  memberCode?: string;
  joiningDate?: Date;
  createdAt: Date;
  avatar?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  orgUnit?: OrganizationUnit | null;
}

interface EmployeeDetailContentProps {
  slug: string;
  tenantId: string;
  memberId: string;
  memberData: MemberData;
  userRole: string;
  userId: string;
}

export default function EmployeeDetailContent({
  slug,
  tenantId,
  memberId,
  memberData,
  userRole,
  userId,
}: EmployeeDetailContentProps) {
  const router = useRouter();
  const labels = useTenantLabels();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const memberCodeDisplay =
    memberData.employeeId ||
    memberData.enrollmentNumber ||
    memberData.memberCode ||
    "-";

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: labels.memberPlural,
            href: basePath(slug) + "/employees",
          },
          { label: memberData.name },
        ]}
        className="mb-4"
      />

      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {memberData.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{memberData.email}</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                {memberData.avatar && <AvatarImage src={memberData.avatar} />}
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-medium">
                  {getInitials(memberData.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{memberData.name}</CardTitle>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {memberData.email}
                  </div>
                  {memberData.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {memberData.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant={memberData.isActive ? "default" : "secondary"}
              className={
                memberData.isActive ? "bg-green-100 text-green-700" : ""
              }
            >
              {memberData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  {labels.memberCode}
                </label>
                <p className="text-gray-900 font-mono mt-1">{memberCodeDisplay}</p>
              </div>
              {memberData.designation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Designation
                  </label>
                  <p className="text-gray-900 mt-1">{memberData.designation}</p>
                </div>
              )}
              {memberData.role && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <Badge variant="outline" className="mt-1">
                    {memberData.role.replace(/_/g, " ")}
                  </Badge>
                </div>
              )}
            </div>

            {/* Dates & Organization */}
            <div className="space-y-4">
              {memberData.joiningDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joining Date
                  </label>
                  <p className="text-gray-900 mt-1">
                    {formatDate(memberData.joiningDate)}
                  </p>
                </div>
              )}
              {memberData.orgUnit && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {labels.orgUnit}
                  </label>
                  <p className="text-gray-900 mt-1">{memberData.orgUnit.name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <p className="text-gray-900 mt-1">
                  {formatDate(memberData.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {memberData.bio && (
            <div className="mt-6 pt-6 border-t">
              <label className="text-sm font-medium text-gray-500">Bio</label>
              <p className="text-gray-900 mt-2 text-sm">{memberData.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <Link href={basePath(slug) + "/employees"}>Back to {labels.memberPlural}</Link>
        </Button>
      </div>
    </div>
  );
}
