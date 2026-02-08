"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type QuickReply = { id: string; shortcut: string; content: string };
type ConnectionStatus = "disconnected" | "connecting" | "ready";

export default function Home() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [templates, setTemplates] = useState<QuickReply[]>([]);
  const [quickReplyOpen, setQuickReplyOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<"idle" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    fetch("/api/whatsapp/status")
      .then((res) => res.json())
      .then((data) => setStatus(data?.status ?? "disconnected"))
      .catch(() => setStatus("disconnected"));
  }, []);

  useEffect(() => {
    if (quickReplyOpen && templates.length === 0) {
      fetch("/api/quick-replies")
        .then((res) => res.json())
        .then((data) => setTemplates(Array.isArray(data) ? data : []))
        .catch(() => setTemplates([]));
    }
  }, [quickReplyOpen, templates.length]);

  const sendQuickReply = async (template: QuickReply) => {
    const num = phone.replace(/\D/g, "");
    if (!num) {
      setErrorText("הזן מספר טלפון עם קידומת מדינה (למשל 972501234567)");
      setMessage("error");
      return;
    }
    setSendingId(template.id);
    setMessage("idle");
    setErrorText("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: num, templateId: template.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("success");
      } else {
        setMessage("error");
        setErrorText(data.error ?? "שליחה נכשלה");
      }
    } catch {
      setMessage("error");
      setErrorText("שגיאת רשת");
    } finally {
      setSendingId(null);
    }
  };

  const isConnected = status === "ready";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <main className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Web Plus</CardTitle>
            <CardDescription>
              תזמון הודעות ותשובות מהירות ל-WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/send">שלח הודעה מהירה</Link>
            </Button>
            {isConnected && (
              <Dialog open={quickReplyOpen} onOpenChange={setQuickReplyOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">שלח תגובה מהירה</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>תגובה מהירה</DialogTitle>
                    <DialogDescription>
                      הזן מספר נמען ובחר תבנית לשליחה
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quick-phone">מספר טלפון</Label>
                      <Input
                        id="quick-phone"
                        dir="ltr"
                        placeholder="972501234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    {message === "success" && (
                      <p className="rounded-md bg-green-500/10 p-2 text-sm text-green-600 dark:text-green-400">
                        ההודעה נשלחה בהצלחה
                      </p>
                    )}
                    {message === "error" && errorText && (
                      <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                        {errorText}
                      </p>
                    )}
                    <div className="max-h-[240px] space-y-2 overflow-y-auto">
                      {templates.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          אין תבניות.{" "}
                          <Link
                            href="/dashboard/quick-replies"
                            className="underline"
                            onClick={() => setQuickReplyOpen(false)}
                          >
                            הוסף תבניות
                          </Link>
                        </p>
                      ) : (
                        templates.map((t) => (
                          <Button
                            key={t.id}
                            variant="secondary"
                            className="h-auto w-full justify-between py-2 text-right"
                            onClick={() => sendQuickReply(t)}
                            disabled={sendingId !== null}
                          >
                            <span className="font-medium">{t.shortcut}</span>
                            {sendingId === t.id ? (
                              <span className="text-muted-foreground">
                                שולח...
                              </span>
                            ) : (
                              <span className="text-muted-foreground">שלח</span>
                            )}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button asChild variant="outline">
              <Link href="/dashboard/quick-replies">ניהול תשובות מהירות</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/templates">ניהול תבניות</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">התחבר / התנתק מ-WhatsApp</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
