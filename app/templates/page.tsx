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

export default function TemplatesPage() {
  const [list, setList] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchList = async () => {
    try {
      const res = await fetch("/api/quick-replies");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcut.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortcut: shortcut.trim(), content: content.trim() }),
      });
      if (res.ok) {
        setShortcut("");
        setContent("");
        fetchList();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/quick-replies/${id}`, { method: "DELETE" });
      if (res.ok) setList((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">ניהול תבניות</h1>
            <p className="text-muted-foreground">
              הוסף תבניות הודעה לשליחה מהירה
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">בית</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>תבנית חדשה</CardTitle>
            <CardDescription>שם קצר ותוכן ההודעה</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shortcut">שם (קיצור)</Label>
                <Input
                  id="shortcut"
                  placeholder="למשל: בדרך"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">תוכן ההודעה</Label>
                <Input
                  id="content"
                  placeholder="אני בדרך אליך!"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "שומר..." : "הוסף תבנית"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-medium">התבניות שלי</h2>
          {loading ? (
            <p className="text-muted-foreground">טוען...</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground">אין עדיין תבניות. הוסף אחת למעלה.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((t) => (
                <Card key={t.id}>
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t.shortcut}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {t.content}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                    >
                      {deletingId === t.id ? "מוחק..." : "מחק"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </ul>
          )}
        </div>

        <Button asChild variant="secondary" className="w-full">
          <Link href="/send">שלח הודעה מהירה ←</Link>
        </Button>
      </div>
    </div>
  );
}
