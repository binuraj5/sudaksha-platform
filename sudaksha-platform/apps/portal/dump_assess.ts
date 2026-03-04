import { prismaCore } from '@sudaksha/db-core';
async function run() {
    console.log("Fetching MA...");
    const ma = await prismaCore.memberAssessment.findMany({ select: { id: true, status: true, assignmentType: true, member: { select: { email: true, type: true } } } });
    console.log(JSON.stringify(ma, null, 2));

    console.log("Fetching PUA...");
    const pua = await prismaCore.projectUserAssessment.findMany({ select: { id: true, status: true, user: { select: { email: true, accountType: true } } } });
    console.log(JSON.stringify(pua, null, 2));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
