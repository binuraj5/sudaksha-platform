import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { users } = await req.json(); // Array of user objects

        if (!users || !Array.isArray(users)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Simulate DB insertions
        const results = users.map(user => ({
            email: user.email,
            status: "SUCCESS",
            message: "User created and invite queued"
        }));

        return NextResponse.json({
            success: true,
            summary: {
                total: users.length,
                success: users.length,
                failed: 0
            },
            results
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
