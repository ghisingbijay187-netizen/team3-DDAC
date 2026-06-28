import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, scamTypes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { initDb } from "@/lib/seed";

initDb();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const row = db
      .select({
        id: reports.id,
        title: reports.title,
        description: reports.description,
        platform: reports.platform,
        scamTypeId: reports.scamTypeId,
        scamTypeName: scamTypes.name,
        financialLoss: reports.financialLoss,
        reporterAge: reports.reporterAge,
        status: reports.status,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .innerJoin(scamTypes, eq(reports.scamTypeId, scamTypes.id))
      .where(eq(reports.id, parseInt(id)))
      .get();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}