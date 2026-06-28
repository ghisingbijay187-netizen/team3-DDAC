import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { createSession } from "@/lib/auth";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);
await initDb();

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

    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id
    `;

    const userId = result[0].id;
    const sessionId = await createSession(userId);

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
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}