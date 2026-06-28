import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getUserFromRequest } from "@/lib/auth";
import { initDb } from "@/lib/seed";

const sql = neon(process.env.DATABASE_URL!);
await initDb();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, adminNotes } = await req.json();
    const valid = ["received", "investigating", "resolved", "rejected"];
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const rows = await sql`
      UPDATE reports
      SET status = ${status}, admin_notes = ${adminNotes ?? null}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await sql`DELETE FROM reports WHERE id = ${parseInt(id)}`;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}