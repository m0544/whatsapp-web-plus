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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquarePlus, Trash2 } from "lucide-react";

type QuickReply = { id: string; shortcut: string; content: string };

export default function QuickRepliesDashboardPage() {
  const [list, setList] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortcut, setShortcut] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
        body: JSON.stringify({
          shortcut: shortcut.trim(),
          content: content.trim(),
        }),
      });
      if (res.ok) {
        setShortcut("");
        setContent("");
        setOpen(false);
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
    <main className="flex-1 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Page title + primary action: same Card language as login/home */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">תשובות מהירות</h1>
            <p className="text-muted-foreground">
              ניהול תבניות הודעה לשליחה מהירה
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#25d366] text-white hover:bg-[#20bd5a]">
                <MessageSquarePlus className="h-4 w-4 ml-1.5" aria-hidden />
                הוסף תבנית
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>תבנית חדשה</DialogTitle>
                <DialogDescription>
                  שם קצר ותוכן ההודעה שיישלח
                </DialogDescription>
              </DialogHeader>
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#25d366] text-white hover:bg-[#20bd5a]"
                  >
                    {submitting ? "שומר..." : "הוסף תבנית"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* List in Card: same component as login/home for consistency */}
        <Card>
          <CardHeader>
            <CardTitle>התבניות</CardTitle>
            <CardDescription>רשימת תשובות מהירות – הוסף, שלח או מחק</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : list.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center">
                <MessageSquarePlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">
                  אין עדיין תבניות. הוסף אחת כדי להתחיל.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setOpen(true)}
                >
                  הוסף תבנית ראשונה
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {list.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
                      aria-hidden
                    >
                      <MessageSquarePlus className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-medium">{t.shortcut}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {t.content}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      aria-label={`מחק תבנית ${t.shortcut}`}
                    >
                      {deletingId === t.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/send">שלח הודעה מהירה</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">← חזרה לבית</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
