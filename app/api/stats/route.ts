import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { initDb } from "@/lib/seed";

initDb();

export async function GET() {
  try {
    const totalReports = (sqlite.prepare("SELECT COUNT(*) as c FROM reports").get() as { c: number }).c;
    const totalLoss = (sqlite.prepare("SELECT COALESCE(SUM(financial_loss), 0) as s FROM reports").get() as { s: number }).s;

    const mostCommon = sqlite.prepare(`
      SELECT st.name, COUNT(*) as c FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      GROUP BY st.name ORDER BY c DESC LIMIT 1
    `).get() as { name: string } | undefined;

    const topPlatform = sqlite.prepare(`
      SELECT platform, COUNT(*) as c FROM reports
      GROUP BY platform ORDER BY c DESC LIMIT 1
    `).get() as { platform: string } | undefined;

    const thisMonth = (sqlite.prepare(`
      SELECT COUNT(*) as c FROM reports
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get() as { c: number }).c;

    const byType = sqlite.prepare(`
      SELECT st.name as scamType, COUNT(*) as count FROM reports r
      JOIN scam_types st ON r.scam_type_id = st.id
      GROUP BY st.name ORDER BY count DESC
    `).all();

    const byPlatform = sqlite.prepare(`
      SELECT platform, COUNT(*) as count FROM reports
      GROUP BY platform ORDER BY count DESC
    `).all();

    const monthly = sqlite.prepare(`
      SELECT strftime('%m/%Y', created_at) as month, COUNT(*) as count
      FROM reports
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY strftime('%Y-%m', created_at)
    `).all();

    return NextResponse.json({
      summary: {
        totalReports,
        totalLoss,
        mostCommonScam: mostCommon?.name ?? "N/A",
        topPlatform: topPlatform?.platform ?? "N/A",
        reportedThisMonth: thisMonth,
      },
      byType,
      byPlatform,
      monthly,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}