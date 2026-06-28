import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, scamTypes } from "@/lib/schema";
import { eq, desc, like, gte, and } from "drizzle-orm";
import { initDb } from "@/lib/seed";
import { getUserFromRequest } from "@/lib/auth";

initDb();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scamTypeId = searchParams.get("scamTypeId");
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const dateRange = searchParams.get("dateRange");
    const sortBy = searchParams.get("sortBy") ?? "newest";
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let query = db
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
      .$dynamic();

    const conditions = [];
    if (scamTypeId) conditions.push(eq(reports.scamTypeId, parseInt(scamTypeId)));
    if (platform) conditions.push(eq(reports.platform, platform));
    if (search) conditions.push(like(reports.title, `%${search}%`));
    if (dateRange) {
      const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
      const days = daysMap[dateRange];
      if (days) {
        const since = new Date(Date.now() - days * 86400000).toISOString();
        conditions.push(gte(reports.createdAt, since));
      }
    }
    if (conditions.length > 0) query = query.where(and(...conditions));

    const rows = sortBy === "oldest"
      ? await query.orderBy(reports.createdAt).limit(limit).offset(offset)
      : sortBy === "highest_loss"
      ? await query.orderBy(desc(reports.financialLoss)).limit(limit).offset(offset)
      : await query.orderBy(desc(reports.createdAt)).limit(limit).offset(offset);

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to submit a report" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, platform, scamTypeId, financialLoss, reporterAge } = body;

    if (!title || !description || !platform || !scamTypeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = db.insert(reports).values({
      title,
      description,
      platform,
      scamTypeId,
      userId: user.id,
      financialLoss: financialLoss ?? null,
      reporterAge: reporterAge ?? null,
    }).returning().get();

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
      .where(eq(reports.id, result.id))
      .get();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}