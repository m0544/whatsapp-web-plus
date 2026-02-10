import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  MessageSquare,
  Send,
  FileText,
  LayoutGrid,
  History,
  LogIn,
  CalendarClock,
} from 'lucide-react';

export function HomePage() {
  const { data: status } = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: () => api.whatsapp.status(),
  });
  const connectionStatus = status?.status ?? 'disconnected';
  const isConnected = connectionStatus === 'ready';

  const actions = [
    {
      to: '/send',
      label: 'שלח הודעה מהירה',
      description: 'שליחת הודעה למספר נבחר',
      icon: Send,
      primary: true,
    },
    ...(isConnected
      ? [
          {
            to: '/dashboard/quick-replies',
            label: 'שלח תגובה מהירה',
            description: 'בחירת תבנית ושליחה',
            icon: MessageSquare,
            primary: false,
          },
        ]
      : []),
    {
      to: '/dashboard/quick-replies',
      label: 'ניהול תשובות מהירות',
      description: 'הוספה ועריכת תבניות',
      icon: FileText,
      primary: false,
    },
    {
      to: '/templates',
      label: 'ניהול תבניות',
      description: 'תבניות הודעה לשליחה מהירה',
      icon: LayoutGrid,
      primary: false,
    },
    {
      to: '/chats',
      label: 'היסטוריית שיחות',
      description: 'טעינה ותיעוד הודעות נכנסות',
      icon: History,
      primary: false,
    },
    {
      to: '/schedule',
      label: 'תזמון הודעות',
      description: 'שליחה אוטומטית בתאריך ושעה',
      icon: CalendarClock,
      primary: false,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      <section className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          WhatsApp Web Plus
        </h1>
        <p className="text-muted-foreground text-sm">
          תזמון הודעות, תשובות מהירות ותיעוד שיחות
        </p>
        {isConnected && (
          <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            מחובר
          </span>
        )}
      </section>

      <div className="grid gap-3">
        {actions.map(({ to, label, description, icon: Icon, primary }) => (
          <Link
            key={to + label}
            to={to}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-primary/30 ${
              primary
                ? 'bg-primary text-primary-foreground border-primary shadow-[var(--shadow)] hover:opacity-95'
                : 'bg-card border-border text-card-foreground hover:bg-accent/50'
            }`}
          >
            <span
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                primary ? 'bg-white/20' : 'bg-primary/10 text-primary'
              }`}
            >
              <Icon className="w-6 h-6" />
            </span>
            <div className="flex-1 text-right min-w-0">
              <div className="font-semibold">{label}</div>
              <div
                className={`text-sm truncate ${
                  primary ? 'text-primary-foreground/85' : 'text-muted-foreground'
                }`}
              >
                {description}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogIn className="w-4 h-4" />
          התחבר / התנתק מ-WhatsApp
        </Link>
      </div>
    </div>
  );
}
