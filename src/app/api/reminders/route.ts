import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Since location is Unsupported geometry, we need to select it using raw SQL if we want GeoJSON
        // or just fetch everything else. For simplicity in this demo, we can fetch all and then
        // do a second query for locations if needed, or use $queryRaw.

        const reminders: any[] = await prisma.$queryRaw`
      SELECT 
        id, "userId", radius, message, "triggerType", "previousState", "isTriggered", "createdAt",
        ST_AsGeoJSON(location)::json as geo_location
      FROM "Reminder"
      WHERE "userId" = ${session.userId}
      ORDER BY "createdAt" DESC
    `;

        // Map back to match previous frontend expectation
        const formattedReminders = reminders.map(r => ({
            ...r,
            location: {
                type: "Point",
                coordinates: r.geo_location.coordinates
            }
        }));

        return NextResponse.json(formattedReminders);
    } catch (error: any) {
        console.error("GET reminders error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { location, radius, message, triggerType } = await req.json();

        if (!location || !radius || !message || !triggerType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // POSTGIS Insert using raw SQL because Prisma doesn't support geometry directly
        const [lng, lat] = location;

        await prisma.$executeRaw`
      INSERT INTO "Reminder" (id, "userId", radius, message, "triggerType", "previousState", "isTriggered", location, "updatedAt")
      VALUES (
        ${Math.random().toString(36).substr(2, 9)}, 
        ${session.userId}, 
        ${parseFloat(radius)}, 
        ${message}, 
        ${triggerType}, 
        'OUTSIDE', 
        false, 
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        NOW()
      )
    `;

        return NextResponse.json({ message: "Reminder created" }, { status: 201 });
    } catch (error: any) {
        console.error("POST reminder error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
