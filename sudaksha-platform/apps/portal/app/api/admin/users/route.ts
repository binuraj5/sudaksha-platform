import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/user-actions";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const filters: any = {};
        if (searchParams.get('search')) filters.search = searchParams.get('search');
        if (searchParams.get('role')) filters.role = searchParams.get('role');
        if (searchParams.get('department')) filters.department = searchParams.get('department');
        if (searchParams.get('page')) filters.page = Number(searchParams.get('page'));
        if (searchParams.get('limit')) filters.limit = Number(searchParams.get('limit'));

        const result = await getUsers(filters);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await createUser(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
