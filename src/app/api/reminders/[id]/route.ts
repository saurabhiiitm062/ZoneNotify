import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify the reminder belongs to the user before deleting
        const reminder = await prisma.reminder.findUnique({
            where: { id }
        });

        if (!reminder) {
            return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
        }

        if (reminder.userId !== session.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.reminder.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Reminder deleted successfully" });
    } catch (error: any) {
        console.error("DELETE reminder error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
