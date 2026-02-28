"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    reminders: any[];
    userLocation: { lat: number; lng: number } | null;
    onMapClick: (lat: number, lng: number) => void;
    selectedLocation: [number, number] | null;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterMap({ location }: { location: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.setView([location.lat, location.lng], 13, {
                animate: true,
                duration: 2,
            });
        }
    }, [location, map]);
    return null;
}

export default function MapComponent({ reminders, userLocation, onMapClick, selectedLocation }: MapProps) {
    return (
        <MapContainer
            center={[0, 0]}
            zoom={2}
            className="w-full h-full"
            zoomControl={false} // Clean up UI
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            <MapEvents onMapClick={onMapClick} />
            <RecenterMap location={userLocation} />

            {/* Existing Reminders */}
            {reminders.map((reminder) => (
                <div key={reminder.id}>
                    <Circle
                        center={[reminder.location.coordinates[1], reminder.location.coordinates[0]]}
                        radius={reminder.radius}
                        pathOptions={{
                            color: reminder.triggerType === "ENTER" ? "#3b82f6" : "#f97316",
                            fillColor: reminder.triggerType === "ENTER" ? "#3b82f6" : "#f97316",
                            fillOpacity: 0.1,
                            weight: 1,
                            dashArray: "5, 5",
                        }}
                    />
                    <Marker position={[reminder.location.coordinates[1], reminder.location.coordinates[0]]}>
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-sm mb-1">{reminder.message}</p>
                                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
                                    {reminder.triggerType} @ {reminder.radius}m
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                </div>
            ))}

            {/* Selected Location Marker */}
            {selectedLocation && (
                <Marker position={selectedLocation}>
                    <Popup>New Geofence Center</Popup>
                </Marker>
            )}

            {/* Current User Location */}
            {userLocation && (
                <div key="user-loc">
                    <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={20}
                        pathOptions={{ color: "#0ea5e9", fillColor: "#0ea5e9", fillOpacity: 0.8 }}
                    />
                    <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={500}
                        pathOptions={{ color: "#0ea5e9", fillOpacity: 0.05, weight: 0.5 }}
                    />
                </div>
            )}
        </MapContainer>
    );
}
