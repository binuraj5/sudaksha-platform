import { getLabelsForTenant } from '../lib/tenant-labels';

function verifyLabels() {
    console.log('--- VERIFYING LABELS ---');

    console.log('\n[CORPORATE]');
    const corp = getLabelsForTenant('CORPORATE');
    console.log(`Member: ${corp.member} (Expected: Employee)`);
    console.log(`Activity: ${corp.activity} (Expected: Project)`);
    console.log(`SubUnit: ${corp.subUnit} (Expected: Team)`);

    console.log('\n[INSTITUTION]');
    const inst = getLabelsForTenant('INSTITUTION');
    console.log(`Member: ${inst.member} (Expected: Student)`);
    console.log(`Activity: ${inst.activity} (Expected: Course)`);
    console.log(`SubUnit: ${inst.subUnit} (Expected: Class)`);

    if (inst.member === 'Student' && corp.member === 'Employee') {
        console.log('\n✅ Labels verified successfully');
    } else {
        console.error('\n❌ Label verification failed');
        process.exit(1);
    }
}

verifyLabels();
