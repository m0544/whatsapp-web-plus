import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function SendPage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const { data: templates = [] } = useQuery({
    queryKey: ['quick-replies'],
    queryFn: () => api.quickReplies.list(),
  });
  const sendMutation = useMutation({
    mutationFn: (body: { phone: string; templateId?: string }) =>
      api.send.post({ ...body, phone: body.phone }),
  });

  const sendTemplate = (templateId: string) => {
    const num = phone.replace(/\D/g, '');
    if (!num) {
      setErrorText('הזן מספר טלפון עם קידומת מדינה');
      setMessage('error');
      return;
    }
    setMessage('idle');
    setErrorText('');
    sendMutation.mutate(
      { phone: num, templateId },
      {
        onSuccess: () => setMessage('success'),
        onError: (err) => {
          setMessage('error');
          setErrorText(err instanceof Error ? err.message : 'שגיאה');
        },
      },
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">שלח מהיר</h1>
            <p className="text-muted-foreground">בחר איש קשר ולחץ על תבנית</p>
          </div>
          <Link to="/" className="rounded border px-3 py-1.5 text-sm">בית</Link>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <label className="block font-medium">מספר טלפון</label>
          <input
            dir="ltr"
            placeholder="972501234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded border border-input px-3 py-2"
          />
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-medium">תבניות</h2>
          {message === 'success' && (
            <p className="rounded bg-green-500/10 p-2 text-sm text-green-600">ההודעה נשלחה בהצלחה</p>
          )}
          {message === 'error' && errorText && (
            <p className="rounded bg-destructive/10 p-2 text-sm text-destructive">{errorText}</p>
          )}
          {templates.length === 0 ? (
            <p className="text-muted-foreground">
              אין תבניות. <Link to="/dashboard/quick-replies" className="underline">הוסף תבניות</Link>
            </p>
          ) : (
            <div className="grid gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => sendTemplate(t.id)}
                  disabled={sendMutation.isPending}
                  className="rounded border bg-secondary px-4 py-2 text-right hover:bg-secondary/80 disabled:opacity-50"
                >
                  <span className="font-medium">{t.shortcut}</span>
                  {sendMutation.isPending ? ' שולח...' : ' שלח'}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link to="/dashboard/quick-replies" className="block rounded border p-3 text-center">
          ניהול תשובות מהירות →
        </Link>
      </div>
    </div>
  );
}
