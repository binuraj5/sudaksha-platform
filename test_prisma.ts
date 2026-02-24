import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const fields = Object.keys(prisma.competency.fields);
    console.log("FIELDS:", fields);
    console.log("HAS SCOPE?", fields.includes("scope"));
    console.log("HAS GLOBAL STATUS?", fields.includes("globalSubmissionStatus"));
}
main();
