import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserFromRequest } from "@/lib/auth";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);
await initDb();

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT r.id, r.title, r.description, r.platform,
        r.scam_type_id as "scamTypeId", st.name as "scamTypeName",
        r.financial_loss as "financialLoss", r.reporter_age as "reporterAge",
        r.status, r.admin_notes as "adminNotes", r.created_at as "createdAt"
      FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      WHERE r.user_id = ${user.id}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}