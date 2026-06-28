import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);


export async function GET() {
  try {
    await initDb();
    const [totalRow] = await sql`SELECT COUNT(*) as total, COALESCE(SUM(financial_loss), 0) as loss FROM reports`;
    const [mostCommon] = await sql`
      SELECT st.name FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      GROUP BY st.name ORDER BY COUNT(*) DESC LIMIT 1
    `;
    const [topPlatform] = await sql`
      SELECT platform FROM reports
      GROUP BY platform ORDER BY COUNT(*) DESC LIMIT 1
    `;
    const [thisMonth] = await sql`
      SELECT COUNT(*) as count FROM reports
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
    `;
    const byType = await sql`
      SELECT st.name as "scamType", COUNT(*) as count FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      GROUP BY st.name ORDER BY count DESC
    `;
    const byPlatform = await sql`
      SELECT platform, COUNT(*) as count FROM reports
      GROUP BY platform ORDER BY count DESC
    `;
    const monthly = await sql`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
      COUNT(*) as count FROM reports
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `;

    return NextResponse.json({
      summary: {
        totalReports: Number(totalRow.total),
        totalLoss: Number(totalRow.loss),
        mostCommonScam: mostCommon?.name ?? "N/A",
        topPlatform: topPlatform?.platform ?? "N/A",
        reportedThisMonth: Number(thisMonth.count),
      },
      byType: byType.map((r) => ({ ...r, count: Number(r.count) })),
      byPlatform: byPlatform.map((r) => ({ ...r, count: Number(r.count) })),
      monthly: monthly.map((r) => ({ ...r, count: Number(r.count) })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}