import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scamTypes } from "@/lib/schema";
import { initDb } from "@/lib/seed";

initDb();

export async function GET() {
  try {
    const types = db.select().from(scamTypes).all();
    return NextResponse.json(
      types.map((t) => ({ ...t, warningSigns: JSON.parse(t.warningSigns) }))
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch scam types" }, { status: 500 });
  }
}