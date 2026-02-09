import { Link } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function QuickRepliesPage() {
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['quick-replies'],
    queryFn: () => api.quickReplies.list(),
  });
  const createMutation = useMutation({
    mutationFn: (body: { shortcut: string; content: string }) =>
      api.quickReplies.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-replies'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.quickReplies.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quick-replies'] }),
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const shortcut = (form.elements.namedItem('shortcut') as HTMLInputElement)?.value?.trim();
    const content = (form.elements.namedItem('content') as HTMLInputElement)?.value?.trim();
    if (!shortcut || !content) return;
    createMutation.mutate(
      { shortcut, content },
      { onSuccess: () => form.reset() },
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">תשובות מהירות</h1>
            <p className="text-muted-foreground">ניהול תבניות הודעה לשליחה מהירה</p>
          </div>
          <Link to="/" className="rounded-md border px-3 py-1.5 text-sm">בית</Link>
        </div>

        <form onSubmit={handleAdd} className="rounded-lg border p-4 space-y-3">
          <h2 className="font-medium">תבנית חדשה</h2>
          <input
            name="shortcut"
            placeholder="שם (קיצור)"
            className="w-full rounded border border-input px-3 py-2"
          />
          <input
            name="content"
            placeholder="תוכן ההודעה"
            className="w-full rounded border border-input px-3 py-2"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            {createMutation.isPending ? 'שומר...' : 'הוסף תבנית'}
          </button>
        </form>

        <div className="rounded-lg border p-4">
          <h2 className="mb-3 font-medium">התבניות</h2>
          {isLoading ? (
            <p className="text-muted-foreground">טוען...</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground">אין תבניות. הוסף אחת למעלה.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{t.shortcut}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">{t.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(t.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded border border-destructive px-2 py-1 text-sm text-destructive"
                  >
                    מחק
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link to="/send" className="block rounded-md border p-3 text-center">
          שלח הודעה מהירה
        </Link>
      </div>
    </div>
  );
}
