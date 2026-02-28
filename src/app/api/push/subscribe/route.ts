import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { endpoint, expirationTime, keys } = await req.json();

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
        }

        // Save or update subscription
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: session.userId,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                userId: session.userId,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });

        return NextResponse.json({ message: "Subscription saved successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Push subscribe error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
