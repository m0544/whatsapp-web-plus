import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function HomePage() {
  const { data: status } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: () => api.whatsapp.status(),
  });
  const connectionStatus = status?.status ?? 'disconnected';
  const isConnected = connectionStatus === 'ready';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">WhatsApp Web Plus</h1>
        <p className="text-muted-foreground">תזמון הודעות ותשובות מהירה ל-WhatsApp</p>
        <div className="flex flex-col gap-2">
          <Link to="/send" className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-center">
            שלח הודעה מהירה
          </Link>
          {isConnected && (
            <Link to="/dashboard/quick-replies" className="rounded-md border px-4 py-2 text-center">
              שלח תגובה מהירה
            </Link>
          )}
          <Link to="/dashboard/quick-replies" className="rounded-md border px-4 py-2 text-center">
            ניהול תשובות מהירות
          </Link>
          <Link to="/templates" className="rounded-md border px-4 py-2 text-center">
            ניהול תבניות
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground">
            התחבר / התנתק מ-WhatsApp
          </Link>
        </div>
      </main>
    </div>
  );
}
