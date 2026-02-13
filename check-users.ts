import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const count = await prisma.user.count()
    console.log(`Total users: ${count}`)
    if (count > 0) {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        console.log(`Admin exists: ${admin ? admin.email : 'No'}`)
    }
}
main().finally(() => prisma.$disconnect())
