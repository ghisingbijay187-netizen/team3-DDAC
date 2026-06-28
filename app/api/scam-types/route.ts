import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);
await initDb();

export async function GET() {
  try {
    const types = await sql`SELECT * FROM scam_types ORDER BY name`;
    return NextResponse.json(
      types.map((t) => ({ ...t, warningSigns: JSON.parse(t.warning_signs) }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch scam types" }, { status: 500 });
  }
}