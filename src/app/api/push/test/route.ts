import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendPushNotification } from "@/services/pushService";

export async function POST() {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: session.userId }
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({ error: "No active subscriptions found. Please subscribe first." }, { status: 400 });
        }

        let results = [];
        for (const sub of subscriptions) {
            const subObj = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            const success = await sendPushNotification(subObj, {
                title: "Tactical Test",
                body: "This is a test notification from ZoneNotify. Signal lock confirmed.",
                icon: "/icon.png",
            });
            results.push({ endpoint: sub.endpoint, success });
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Test notification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
