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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type QuickReply = { id: string; shortcut: string; content: string };

export default function SendPage() {
  const [phone, setPhone] = useState("");
  const [templates, setTemplates] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<"idle" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    fetch("/api/quick-replies")
      .then((res) => res.json())
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const sendTemplate = async (template: QuickReply) => {
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
        body: JSON.stringify({
          phone: num,
          templateId: template.id,
        }),
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">שלח מהיר</h1>
            <p className="text-muted-foreground">
              בחר איש קשר ולחץ על תבנית – הודעה נשלחת בלחיצה
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">בית</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>שלב 1: מספר נמען</CardTitle>
            <CardDescription>
              הזן מספר עם קידומת מדינה (ללא + או רווחים), למשל 972501234567
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="phone">מספר טלפון</Label>
            <Input
              id="phone"
              dir="ltr"
              className="mt-2"
              placeholder="972501234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>שלב 2: בחר תבנית לשליחה</CardTitle>
            <CardDescription>
              לחיצה על תבנית שולחת את ההודעה מיד לאיש הקשר שבחרת
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
            {loading ? (
              <p className="text-muted-foreground">טוען תבניות...</p>
            ) : templates.length === 0 ? (
              <p className="text-muted-foreground">
                אין תבניות.{" "}
                <Link href="/templates" className="underline">
                  הוסף תבניות
                </Link>
              </p>
            ) : (
              <div className="grid gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.id}
                    variant="secondary"
                    className="h-auto justify-start py-3 text-right"
                    onClick={() => sendTemplate(t)}
                    disabled={sendingId !== null}
                  >
                    <span className="flex-1 font-medium">{t.shortcut}</span>
                    {sendingId === t.id ? (
                      <span className="text-muted-foreground">שולח...</span>
                    ) : (
                      <span className="text-muted-foreground">שלח</span>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button asChild variant="outline" className="w-full">
          <Link href="/templates">ניהול תבניות →</Link>
        </Button>
      </div>
    </div>
  );
}
