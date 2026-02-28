import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { processLocationUpdate } from "@/services/geofenceService";

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { location } = await req.json(); // { lat, lng }

        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            return NextResponse.json({ error: "Invalid location data" }, { status: 400 });
        }

        await processLocationUpdate(session.userId, location);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Location update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
