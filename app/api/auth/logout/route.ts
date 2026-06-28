import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/session=([^;]+)/);
  if (match) deleteSession(match[1]);

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}