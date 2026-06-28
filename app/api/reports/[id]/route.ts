import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const rows = await sql`
      SELECT r.id, r.title, r.description, r.platform,
        r.scam_type_id as "scamTypeId", st.name as "scamTypeName",
        r.financial_loss as "financialLoss", r.reporter_age as "reporterAge",
        r.status, r.admin_notes as "adminNotes", r.created_at as "createdAt"
      FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      WHERE r.id = ${parseInt(id)}
    `;

    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}