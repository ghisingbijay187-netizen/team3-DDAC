import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);


export async function GET(req: NextRequest) {
  try {
    await initDb();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const tips = category
      ? await sql`SELECT * FROM tips WHERE category = ${category}`
      : await sql`SELECT * FROM tips`;

    return NextResponse.json(tips);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 });
  }
}