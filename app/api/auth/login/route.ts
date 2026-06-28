import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sqlite } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { initDb } from "@/lib/seed";

initDb();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = sqlite.prepare(
      "SELECT id, username, email, password_hash, is_admin FROM users WHERE email = ?"
    ).get(email) as {
      id: number;
      username: string;
      email: string;
      password_hash: string;
      is_admin: number;
    } | undefined;

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const sessionId = createSession(user.id);
    const isAdmin = user.is_admin === 1;

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin,
      },
      // Tell the frontend where to redirect
      redirect: isAdmin ? "/admin" : "/",
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}