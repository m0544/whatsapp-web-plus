import { NextResponse } from "next/server";
import { getConnectionStatus, getQrDataUrl } from "@/lib/whatsapp/store";
import { initClient } from "@/lib/whatsapp/client";

export async function GET() {
  try {
    await initClient();
  } catch {
    // init might fail if already in progress
  }

  const status = getConnectionStatus();
  const qr = getQrDataUrl();

  return NextResponse.json({
    status,
    qr: qr ?? undefined,
  });
}
