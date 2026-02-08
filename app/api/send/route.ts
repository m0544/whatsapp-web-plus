import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/whatsapp/client";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      content,
      templateId,
    }: {
      phone?: string;
      content?: string;
      templateId?: string;
    } = body;

    let messageContent = content?.trim();
    if (templateId && !messageContent) {
      const template = await prisma.quickReply.findUnique({
        where: { id: templateId },
      });
      messageContent = template?.content ?? "";
    }

    if (!phone?.trim() || !messageContent) {
      return NextResponse.json(
        { error: "נדרשים מספר טלפון ותוכן הודעה (או templateId)" },
        { status: 400 }
      );
    }

    const result = await sendMessage(phone.trim(), messageContent);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "שליחה נכשלה" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "שגיאה בשליחת ההודעה" },
      { status: 500 }
    );
  }
}
