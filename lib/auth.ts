import { sqlite } from "./db";
import crypto from "crypto";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export function createSession(userId: number): string {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  sqlite.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  ).run(sessionId, userId, expiresAt);
  return sessionId;
}

export function getSession(sessionId: string): SessionUser | null {
  const row = sqlite.prepare(`
    SELECT u.id, u.username, u.email, u.is_admin, s.expires_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(sessionId) as {
    id: number;
    username: string;
    email: string;
    is_admin: number;
    expires_at: string;
  } | undefined;

  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    sqlite.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    isAdmin: row.is_admin === 1,
  };
}

export function deleteSession(sessionId: string): void {
  sqlite.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function getUserFromRequest(req: Request): SessionUser | null {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  return getSession(match[1]);
}