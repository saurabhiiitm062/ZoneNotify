import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export async function signToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded: any = await verifyToken(token);
    if (!decoded) return null;

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
    });

    if (!user) return null;

    return { userId: user.id, email: user.email, name: user.name };
}
