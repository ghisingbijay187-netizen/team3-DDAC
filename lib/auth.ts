import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `;
  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionUser | null> {
  const rows = await sql`
    SELECT u.id, u.username, u.email, u.is_admin, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
  `;

  if (rows.length === 0) return null;
  const row = rows[0];

  if (new Date(row.expires_at) < new Date()) {
    await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    isAdmin: row.is_admin,
  };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
}

export async function getUserFromRequest(req: Request): Promise<SessionUser | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  return getSession(match[1]);
}