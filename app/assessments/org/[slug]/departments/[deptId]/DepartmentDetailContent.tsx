"use client";

import { CorporateDepartmentDetailContent } from "./CorporateDepartmentDetailContent";
import { InstitutionDepartmentDetailContent } from "./InstitutionDepartmentDetailContent";

interface DepartmentDetailContentProps {
  slug: string;
  clientId: string;
  deptId: string;
  tenantType: "CORPORATE" | "INSTITUTION" | "SYSTEM";
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

export function DepartmentDetailContent({
  slug,
  clientId,
  deptId,
  tenantType,
  department,
}: DepartmentDetailContentProps) {
  if (tenantType === "CORPORATE") {
    return (
      <CorporateDepartmentDetailContent
        slug={slug}
        clientId={clientId}
        deptId={deptId}
        department={department}
      />
    );
  }

  return (
    <InstitutionDepartmentDetailContent
      slug={slug}
      clientId={clientId}
      deptId={deptId}
      department={department}
    />
  );
}
