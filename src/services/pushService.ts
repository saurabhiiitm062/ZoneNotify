import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
    webpush.setVapidDetails("mailto:example@yourdomain.com", publicKey, privateKey);
}

export async function sendPushNotification(subscription: any, payload: any) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        console.log("Push notification sent successfully");
        return true;
    } catch (error: any) {
        console.error("Error sending push notification:", error);
        // If subscription is expired or invalid, we could handle it here
        if (error.statusCode === 404 || error.statusCode === 410) {
            console.log("Subscription expired or no longer valid");
            return false; // Indicate caller should remove subscription
        }
        return false;
    }
}
