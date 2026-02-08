import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const list = await prisma.quickReply.findMany({
      orderBy: { shortcut: "asc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בטעינת התבניות" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shortcut, content } = body as { shortcut?: string; content?: string };
    if (!shortcut?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "נדרשים shortcut ותוכן" },
        { status: 400 }
      );
    }
    const created = await prisma.quickReply.create({
      data: { shortcut: shortcut.trim(), content: content.trim() },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשמירת התבנית" },
      { status: 500 }
    );
  }
}
