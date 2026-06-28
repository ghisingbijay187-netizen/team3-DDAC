import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, scamTypes } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";
import { initDb } from "@/lib/seed";

initDb();

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = db
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
        adminNotes: reports.adminNotes,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .innerJoin(scamTypes, eq(reports.scamTypeId, scamTypes.id))
      .where(eq(reports.userId, user.id))
      .orderBy(desc(reports.createdAt))
      .all();

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}