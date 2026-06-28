import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sqlite } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { initDb } from "@/lib/seed";

initDb();

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const existing = sqlite.prepare(
      "SELECT id FROM users WHERE email = ? OR username = ?"
    ).get(email, username);

    if (existing) {
      return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = sqlite.prepare(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
    ).run(username, email, passwordHash);

    const userId = result.lastInsertRowid as number;
    const sessionId = createSession(userId);

    const response = NextResponse.json({
      user: { id: userId, username, email },
    }, { status: 201 });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}