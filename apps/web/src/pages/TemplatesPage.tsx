import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function TemplatesPage() {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['quick-replies'],
    queryFn: () => api.quickReplies.list(),
  });

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">ניהול תבניות</h1>
            <p className="text-muted-foreground">הוסף תבניות הודעה לשליחה מהירה</p>
          </div>
          <Link to="/" className="rounded border px-3 py-1.5 text-sm">בית</Link>
        </div>
        <p className="text-muted-foreground">
          ניהול תבניות זמין בדף <Link to="/dashboard/quick-replies" className="underline">תשובות מהירות</Link>.
        </p>
        {isLoading ? (
          <p className="text-muted-foreground">טוען...</p>
        ) : (
          <ul className="space-y-2">
            {list.map((t) => (
              <li key={t.id} className="rounded border p-3">
                <p className="font-medium">{t.shortcut}</p>
                <p className="text-sm text-muted-foreground truncate">{t.content}</p>
              </li>
            ))}
          </ul>
        )}
        <Link to="/send" className="block rounded border p-3 text-center">שלח הודעה מהירה ←</Link>
      </div>
    </div>
  );
}
