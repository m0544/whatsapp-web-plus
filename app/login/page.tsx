"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Status = "disconnected" | "connecting" | "ready";

export default function LoginPage() {
  const [status, setStatus] = useState<Status>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/whatsapp/status");
        const data = await res.json();
        if (cancelled) return;
        setStatus(data.status ?? "disconnected");
        setQr(data.qr ?? null);
      } catch {
        if (!cancelled) setStatus("disconnected");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>WhatsApp Web Plus</CardTitle>
            <CardDescription>טוען...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              טוען חיבור
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400">
              מחובר
            </CardTitle>
            <CardDescription>
              WhatsApp Web Plus מחובר בהצלחה. אפשר להמשיך לאפליקציה.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">לעמוד הבית</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>WhatsApp Web Plus</CardTitle>
          <CardDescription>
            סרוק את קוד ה-QR עם WhatsApp במכשיר שלך כדי להתחבר
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {qr ? (
            <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="QR Code for WhatsApp"
                width={300}
                height={300}
                className="size-[300px]"
              />
            </div>
          ) : (
            <div className="h-[300px] w-[300px] flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
              {status === "connecting"
                ? "מחכה ל-QR..."
                : "החיבור יתחיל בקרוב"}
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            WhatsApp → הגדרות → מכשירים מחוברים → חבר מכשיר
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
