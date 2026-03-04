'use server'

import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function getUsers(filters: any = {}) {
    try {
        const { page = 1, limit = 10, search, role, tenantId, orgUnitId } = filters
        const skip = (page - 1) * limit

        const where: any = {}

        if (tenantId) {
            where.tenantId = tenantId
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { externalId: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (role && role !== 'ALL') {
            where.role = role
        }

        if (orgUnitId && orgUnitId !== 'ALL') {
            where.orgUnitId = orgUnitId
        }

        const [members, total] = await Promise.all([
            prisma.member.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    externalId: true,
                    role: true,
                    type: true,
                    orgUnitId: true,
                    isActive: true,
                    createdAt: true,
                    tenantId: true,
                    tenant: { select: { name: true, type: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            }),
            prisma.member.count({ where })
        ])

        return {
            success: true,
            data: members.map(m => ({ ...m, status: m.isActive ? 'ACTIVE' : 'INACTIVE' })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        }
    } catch (error) {
        console.error('Failed to get members:', error)
        return { success: false, error: 'Failed to fetch members' }
    }
}

export async function createUser(userData: any) {
    try {
        const { name, email, password, externalId, role, orgUnitId, tenantId, type } = userData

        // Check if member exists
        const existingMember = await prisma.member.findFirst({
            where: {
                OR: [
                    { email },
                    externalId ? { externalId } : {}
                ].filter(condition => Object.keys(condition).length > 0)
            }
        })

        if (existingMember) {
            return { success: false, error: 'Member with this email or External ID already exists' }
        }

        const hashedPassword = await hash(password, 12)

        const member = await prisma.member.create({
            data: {
                name,
                email,
                password: hashedPassword,
                externalId,
                role: role || 'ASSESSOR',
                orgUnitId,
                tenantId,
                type: type || 'EMPLOYEE',
                isActive: true
            }
        })

        revalidatePath('/admin/users')
        return { success: true, member }
    } catch (error) {
        console.error('Failed to create member:', error)
        return { success: false, error: 'Failed to create member' }
    }
}

export async function updateUser(id: string, userData: any) {
    try {
        const { name, email, role, orgUnitId, status, type } = userData

        const data: any = { name, email, role, orgUnitId, type }
        if (userData.password) {
            data.password = await hash(userData.password, 12)
        }
        if (status) {
            data.isActive = status === 'ACTIVE'
        }

        const member = await prisma.member.update({
            where: { id },
            data
        })

        revalidatePath('/admin/users')
        return { success: true, member }

    } catch (error) {
        console.error('Failed to update member:', error)
        return { success: false, error: 'Failed to update member' }
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.member.delete({
            where: { id }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete member:', error)
        return { success: false, error: 'Failed to delete member' }
    }
}

export async function bulkDeleteUsers(ids: string[]) {
    try {
        await prisma.member.deleteMany({
            where: { id: { in: ids } }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Failed to bulk delete members:', error)
        return { success: false, error: 'Failed to delete members' }
    }
}
