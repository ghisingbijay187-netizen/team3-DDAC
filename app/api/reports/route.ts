import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserFromRequest } from "@/lib/auth";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);
await initDb();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scamTypeId = searchParams.get("scamTypeId");
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const dateRange = searchParams.get("dateRange");
    const sortBy = searchParams.get("sortBy") ?? "newest";
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let rows = await sql`
      SELECT r.id, r.title, r.description, r.platform,
        r.scam_type_id as "scamTypeId", st.name as "scamTypeName",
        r.financial_loss as "financialLoss", r.reporter_age as "reporterAge",
        r.status, r.admin_notes as "adminNotes",
        r.created_at as "createdAt"
      FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      ORDER BY r.created_at DESC
    `;

    // Filter in JS since neon tagged templates don't support dynamic WHERE easily
    if (scamTypeId) rows = rows.filter((r) => r.scamTypeId === parseInt(scamTypeId));
    if (platform) rows = rows.filter((r) => r.platform === platform);
    if (status) rows = rows.filter((r) => r.status === status);
    if (search) rows = rows.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
    if (dateRange) {
      const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
      const days = daysMap[dateRange];
      if (days) {
        const since = new Date(Date.now() - days * 86400000);
        rows = rows.filter((r) => new Date(r.createdAt) >= since);
      }
    }

    if (sortBy === "oldest") rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "highest_loss") rows.sort((a, b) => (b.financialLoss ?? 0) - (a.financialLoss ?? 0));

    return NextResponse.json(rows.slice(offset, offset + limit));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to submit a report" }, { status: 401 });
    }

    const { title, description, platform, scamTypeId, financialLoss, reporterAge } = await req.json();

    if (!title || !description || !platform || !scamTypeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO reports (title, description, platform, scam_type_id, user_id, financial_loss, reporter_age)
      VALUES (${title}, ${description}, ${platform}, ${scamTypeId}, ${user.id}, ${financialLoss ?? null}, ${reporterAge ?? null})
      RETURNING id
    `;

    const [row] = await sql`
      SELECT r.id, r.title, r.description, r.platform,
        r.scam_type_id as "scamTypeId", st.name as "scamTypeName",
        r.financial_loss as "financialLoss", r.reporter_age as "reporterAge",
        r.status, r.created_at as "createdAt"
      FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      WHERE r.id = ${result[0].id}
    `;

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}