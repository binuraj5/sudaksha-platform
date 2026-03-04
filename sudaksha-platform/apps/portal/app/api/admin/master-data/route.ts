import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for validation
const MasterDataSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    isActive: z.boolean().optional(),
});

type MasterDataType = 'category' | 'industry' | 'courseType' | 'level' | 'domain';

// Helper to get model delegate based on type
const getModel = (type: string) => {
    switch (type) {
        case 'category': return prisma.masterCategory;
        case 'industry': return prisma.masterIndustry;
        case 'courseType': return prisma.masterCourseType;
        case 'level': return prisma.masterLevel;
        case 'domain': return prisma.masterDomain;
        default: return null;
    }
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as MasterDataType;

        if (!type) {
            return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 });
        }

        const model = getModel(type);
        if (!model) {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        // @ts-ignore - Prisma dynamic access
        const data = await model.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Master Data GET Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle Bulk Upload
        if (Array.isArray(body)) {
            const { searchParams } = new URL(request.url);
            const type = searchParams.get('type') as MasterDataType;

            if (!type || !getModel(type)) {
                return NextResponse.json({ success: false, error: 'Type is required query param for bulk upload' }, { status: 400 });
            }

            const model = getModel(type);
            let createdCount = 0;
            let errors = [];

            // Process sequentially to avoid race conditions on unique constraints if necessary, or Promise.all
            for (const item of body) {
                try {
                    const validation = MasterDataSchema.safeParse({ name: item.name, isActive: item.isActive });
                    if (!validation.success) continue;

                    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    // @ts-ignore
                    await model.create({
                        data: {
                            name: item.name,
                            slug,
                            isActive: item.isActive !== undefined ? item.isActive : true
                        }
                    });
                    createdCount++;
                } catch (e) {
                    errors.push({ name: item.name, error: 'Failed' });
                }
            }

            return NextResponse.json({ success: true, count: createdCount, errors });
        }

        // Single Create (Legacy/Form)
        const { type, name, isActive } = body;

        // Validate type and name
        if (!type || !getModel(type)) {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        const validation = MasterDataSchema.safeParse({ name, isActive });
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.issues[0].message }, { status: 400 });
        }

        const model = getModel(type);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // @ts-ignore
        const newItem = await model.create({
            data: {
                name,
                slug,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Master Data POST Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create item(s)' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, type, name, isActive } = body;

        if (!id || !type || !getModel(type)) {
            return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
        }

        const model = getModel(type);
        const updateData: any = {};

        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        // @ts-ignore
        const updatedItem = await model.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (error) {
        console.error('Master Data PUT Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as MasterDataType;
        const id = searchParams.get('id');
        const ids = searchParams.get('ids'); // Comma separated

        if ((!id && !ids) || !type || !getModel(type)) {
            return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
        }

        const model = getModel(type);

        if (ids) {
            // Bulk Delete
            const idList = ids.split(',');
            // @ts-ignore
            await model.deleteMany({
                where: { id: { in: idList } }
            });
        } else {
            // Single Delete
            // @ts-ignore
            await model.delete({
                where: { id: id! }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Master Data DELETE Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete item(s)' }, { status: 500 });
    }
}
