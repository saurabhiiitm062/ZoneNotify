import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    // Paths that require authentication
    const protectedPaths = ["/dashboard", "/api/reminders", "/api/location", "/api/push"];
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

    // Paths that are only for guests
    const guestPaths = ["/login", "/register"];
    const isGuestPath = guestPaths.some((path) => pathname.startsWith(path));

    if (isProtectedPath) {
        if (!token) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            await jose.jwtVerify(token, secret);
            return NextResponse.next();
        } catch (error) {
            console.error("JWT Verification failed:", error);
            if (pathname.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    if (isGuestPath && token) {
        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            await jose.jwtVerify(token, secret);
            return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch (error) {
            // Token invalid, allow guest access
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
