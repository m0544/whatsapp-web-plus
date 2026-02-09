import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function LoginPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: () => api.whatsapp.status(),
    refetchInterval: (query) => {
      const d = query.state.data;
      if (d?.status === 'ready') return false;
      if (d?.qr) return 5000;
      if (d?.status === 'connecting') return 2000;
      return 3000;
    },
    refetchIntervalInBackground: false,
  });
  const status = data?.status ?? 'disconnected';
  const qr = data?.qr;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground">טוען חיבור...</p>
      </div>
    );
  }

  if (status === 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-lg border border-green-500/50 bg-green-500/5 p-6 max-w-md text-center space-y-4">
          <h2 className="text-lg font-semibold text-green-600">מחובר</h2>
          <p className="text-muted-foreground">WhatsApp Web Plus מחובר בהצלחה.</p>
          <Link to="/" className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">
            לעמוד הבית
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="rounded-lg border p-6 max-w-md text-center space-y-4">
        <h1 className="text-xl font-semibold">WhatsApp Web Plus</h1>
        <p className="text-muted-foreground">סרוק את קוד ה-QR עם WhatsApp במכשיר שלך כדי להתחבר</p>
        {qr ? (
          <img src={qr} alt="QR Code" width={300} height={300} className="mx-auto rounded border" />
        ) : (
          <div className="h-[300px] w-[300px] mx-auto flex items-center justify-center rounded border border-dashed text-muted-foreground">
            {status === 'connecting' ? 'מחכה ל-QR...' : 'החיבור יתחיל בקרוב'}
          </div>
        )}
        <p className="text-sm text-muted-foreground">WhatsApp → הגדרות → מכשירים מחוברים → חבר מכשיר</p>
      </div>
    </div>
  );
}
