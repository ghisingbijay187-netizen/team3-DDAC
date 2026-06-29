import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

export async function GET() {
  const users = await sql`SELECT id, email, role FROM users`;
  return NextResponse.json(users);
}