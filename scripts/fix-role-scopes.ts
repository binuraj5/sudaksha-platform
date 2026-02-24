import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GLOBAL_ROLE_NAMES = [
  "Recruiter - HR",
  "Talent Acquisition - Manager",
  "Sales Executive",
];

async function main() {
  console.log("Fixing role scopes for tenant-owned roles...\n");

  const tenantRoles = await prisma.role.findMany({
    where: {
      tenantId: { not: null },
      name: { notIn: GLOBAL_ROLE_NAMES },
    },
    include: { tenant: { select: { slug: true, name: true } } },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${tenantRoles.length} tenant-owned role(s) to fix.\n`);

  let updated = 0;

  for (let i = 0; i < tenantRoles.length; i++) {
    const role = tenantRoles[i];
    const slugPrefix =
      role.tenant?.slug?.split("-")[0]?.toUpperCase() || "ORG";
    const shortName = role.name
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "R");
    const newCode = `${slugPrefix}-${shortName}${i + 1}`;

    const needsScopeUpdate =
      (role as any).scope !== "ORGANIZATION" || role.visibility !== "TENANT_SPECIFIC";
    const needsCodeUpdate = role.code !== newCode && role.code?.startsWith("CUST-");

    if (!needsScopeUpdate && !needsCodeUpdate) {
      console.log(`  [SKIP] "${role.name}" (${role.code}) - already correct`);
      continue;
    }

    const data: Record<string, string> = {};
    if (needsScopeUpdate) {
      data.scope = "ORGANIZATION";
      data.visibility = "TENANT_SPECIFIC";
    }
    if (needsCodeUpdate) {
      data.code = newCode;
    }

    await prisma.role.update({ where: { id: role.id }, data: data as any });
    updated++;
    console.log(
      `  [FIXED] "${role.name}" | ${role.code} -> ${data.code || role.code} | scope: ${(role as any).scope} -> ${data.scope || (role as any).scope} | tenant: ${role.tenant?.name}`
    );
  }

  console.log(`\nDone. Updated ${updated} role(s).`);

  // Ensure the 3 global roles have correct visibility
  await prisma.role.updateMany({
    where: {
      tenantId: null,
      scope: "GLOBAL",
      visibility: { not: "UNIVERSAL" },
    } as any,
    data: { visibility: "UNIVERSAL" },
  });

  const globalRoles = await prisma.role.findMany({
    where: { name: { in: GLOBAL_ROLE_NAMES } },
    select: { name: true, code: true, scope: true, visibility: true, tenantId: true },
  });

  console.log("\nVerifying global roles:");
  for (const r of globalRoles) {
    console.log(
      `  "${r.name}" | code: ${r.code} | scope: ${(r as any).scope} | visibility: ${r.visibility} | tenantId: ${r.tenantId}`
    );
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
