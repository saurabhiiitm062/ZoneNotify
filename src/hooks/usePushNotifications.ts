import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then((sub) => {
                    setSubscription(sub);
                    setIsSubscribed(!!sub);
                });
            });
        }
    }, []);

    const subscribe = async () => {
        if (!registration) return;

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
            });

            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub),
            });

            setSubscription(sub);
            setIsSubscribed(true);
            return true;
        } catch (error) {
            console.error("Failed to subscribe to push notifications:", error);
            return false;
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();
            // Optionally notify backend to remove subscription
            setSubscription(null);
            setIsSubscribed(false);
        } catch (error) {
            console.error("Failed to unsubscribe from push notifications:", error);
        }
    };

    const isSupported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

    return { isSubscribed, subscribe, unsubscribe, isSupported };
}
