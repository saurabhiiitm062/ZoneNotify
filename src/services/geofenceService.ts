import prisma from "@/lib/prisma";
import { sendPushNotification } from "./pushService";

interface Location {
    lng: number;
    lat: number;
}

export async function processLocationUpdate(userId: string, location: Location) {
    // Use raw SQL to find and calculate distances using PostGIS
    // ST_DistanceSphere gives distance in meters

    const reminders: any[] = await prisma.$queryRaw`
    SELECT 
      id, radius, message, "triggerType", "previousState", "isTriggered",
      ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)) as distance
    FROM "Reminder"
    WHERE "userId" = ${userId}
  `;

    for (const reminder of reminders) {
        const isInside = reminder.distance <= reminder.radius;
        const currentState = isInside ? "INSIDE" : "OUTSIDE";

        let shouldTrigger = false;

        if (reminder.triggerType === "ENTER") {
            if (reminder.previousState === "OUTSIDE" && currentState === "INSIDE") {
                shouldTrigger = true;
            }
        } else if (reminder.triggerType === "EXIT") {
            if (reminder.previousState === "INSIDE" && currentState === "OUTSIDE") {
                shouldTrigger = true;
            }
        }

        // Update reminder state
        await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
                previousState: currentState,
                isTriggered: shouldTrigger ? true : reminder.isTriggered,
            }
        });

        if (shouldTrigger) {
            console.log(`Triggering reminder: ${reminder.message}`);
            await triggerPushNotification(userId, reminder.message);
        }
    }
}

async function triggerPushNotification(userId: string, message: string) {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
    });

    for (const sub of subscriptions) {
        const subObj = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        };

        const success = await sendPushNotification(subObj, {
            title: "Location Reminder",
            body: message,
            icon: "/icon.png",
        });

        if (!success) {
            // Remove dead subscription
            await prisma.pushSubscription.delete({
                where: { id: sub.id }
            });
        }
    }
}
