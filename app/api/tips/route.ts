import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tips } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { initDb } from "@/lib/seed";

initDb();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const rows = category
      ? db.select().from(tips).where(eq(tips.category, category)).all()
      : db.select().from(tips).all();
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 });
  }
}