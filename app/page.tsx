import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
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
