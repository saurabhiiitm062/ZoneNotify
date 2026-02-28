import { useState, useEffect } from "react";

export function useGeolocation() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        const handleSuccess = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            setLocation(newLocation);

            // Send location to backend
            try {
                await fetch("/api/location/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ location: newLocation }),
                });
            } catch (err) {
                console.error("Failed to update location on server:", err);
            }
        };

        const handleError = (error: GeolocationPositionError) => {
            setError(error.message);
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 10000, // 10 seconds
            timeout: 5000,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return { location, error };
}
