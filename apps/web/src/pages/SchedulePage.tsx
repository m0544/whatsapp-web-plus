import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CalendarClock, Trash2, Pencil } from 'lucide-react';

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatSchedule(iso: string): string {
  return new Date(iso).toLocaleString('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

const statusLabel: Record<string, string> = {
  Pending: 'ממתין',
  Sent: 'נשלח',
  Failed: 'נכשל',
};

function formatPhone(remoteId: string): string {
  const num = remoteId.replace(/@c\.us$/, '').replace(/\D/g, '');
  return num ? `+${num}` : remoteId;
}

export function SchedulePage() {
  const [searchParams] = useSearchParams();
  const contactIdFromUrl = searchParams.get('contactId') ?? '';
  const phoneFromUrl = searchParams.get('phone') ?? '';

  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [contactId, setContactId] = useState(contactIdFromUrl);
  const [scheduledAt, setScheduledAt] = useState('');

  useEffect(() => {
    if (contactIdFromUrl) setContactId(contactIdFromUrl);
  }, [contactIdFromUrl]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editScheduledAt, setEditScheduledAt] = useState('');

  const {
    data: items = [],
    isLoading,
    isError: isScheduledError,
    error: scheduledError,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: ['scheduled'],
    queryFn: () => api.scheduled.list(),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (body: { content: string; scheduledAt: string; contactId: string }) =>
      api.scheduled.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      setContent('');
      setContactId('');
      setScheduledAt('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { content?: string; scheduledAt?: string } }) =>
      api.scheduled.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.scheduled.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const at = scheduledAt || undefined;
    if (!content.trim() || !contactId.trim() || !at) return;
    const dt = new Date(at);
    if (dt <= new Date()) return;
    createMutation.mutate(
      { content: content.trim(), scheduledAt: at, contactId: contactId.trim() },
    );
  };

  const startEdit = (item: { id: string; content: string; scheduledAt: string }) => {
    setEditingId(item.id);
    setEditContent(item.content);
    setEditScheduledAt(toDatetimeLocal(item.scheduledAt));
  };

  const saveEdit = () => {
    if (!editingId) return;
    const body: { content?: string; scheduledAt?: string } = {};
    if (editContent.trim()) body.content = editContent.trim();
    if (editScheduledAt) body.scheduledAt = new Date(editScheduledAt).toISOString();
    if (Object.keys(body).length) {
      updateMutation.mutate({ id: editingId, body });
    } else setEditingId(null);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">תזמון הודעות</h1>
      <p className="text-muted-foreground text-sm mb-6">
        בחר תאריך ושעה – ההודעה תישלח אוטומטית גם כשהדפדפן סגור.
      </p>

      <section className="rounded-xl border border-border bg-card p-4 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          הודעה מתוזמנת חדשה
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">מזהה מגע (contactId)</label>
            <input
              dir="ltr"
              type="text"
              placeholder="מזהה או בחר מהצד"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            {phoneFromUrl && (
              <p className="text-xs text-muted-foreground mt-1">
                נבחר: {phoneFromUrl}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">תוכן ההודעה</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="כתוב את ההודעה..."
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">תאריך ושעת שליחה</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim() || !contactId.trim() || !scheduledAt || createMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {createMutation.isPending ? 'שומר...' : 'הוסף לתור'}
          </button>
          {createMutation.isError && (
            <p className="text-sm text-destructive">{createMutation.error?.message}</p>
          )}
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">תור ההודעות</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">טוען...</p>
        ) : isScheduledError ? (
          <div className="rounded-xl border border-border bg-destructive/5 p-4 text-sm text-destructive flex flex-wrap items-center gap-2">
            <span>{scheduledError instanceof Error ? scheduledError.message : 'שגיאה בטעינה'}</span>
            <button
              type="button"
              onClick={() => refetchScheduled()}
              className="underline"
            >
              נסה שוב
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
            אין הודעות מתוזמנות. הוסף אחת למעלה.
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right py-3 px-3 font-medium">נמען</th>
                  <th className="text-right py-3 px-3 font-medium">תוכן</th>
                  <th className="text-right py-3 px-3 font-medium">מתי לשלוח</th>
                  <th className="text-right py-3 px-3 font-medium">סטטוס</th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-2 px-3" dir="ltr">
                      {item.contact?.name ?? formatPhone(item.contact?.remoteId ?? item.contactId)}
                    </td>
                    <td className="py-2 px-3 max-w-[200px] truncate" title={item.content}>
                      {editingId === item.id ? (
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="w-full rounded border px-2 py-1 text-sm"
                        />
                      ) : (
                        item.content
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {editingId === item.id ? (
                        <input
                          type="datetime-local"
                          value={editScheduledAt}
                          onChange={(e) => setEditScheduledAt(e.target.value)}
                          className="rounded border px-2 py-1 text-sm"
                        />
                      ) : (
                        formatSchedule(item.scheduledAt)
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={
                          item.status === 'Pending'
                            ? 'text-amber-600'
                            : item.status === 'Sent'
                              ? 'text-green-600'
                              : 'text-destructive'
                        }
                      >
                        {statusLabel[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {editingId === item.id ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="p-1.5 rounded hover:bg-accent text-primary"
                          >
                            שמור
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded hover:bg-accent"
                          >
                            ביטול
                          </button>
                        </div>
                      ) : item.status === 'Pending' ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded hover:bg-accent"
                            aria-label="ערוך"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                            aria-label="מחק"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
