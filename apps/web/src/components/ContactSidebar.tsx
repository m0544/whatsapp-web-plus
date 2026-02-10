import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, mediaUrl } from '@/lib/api';
import { RefreshCw, Send, CalendarClock } from 'lucide-react';

function ContactAvatar({
  src,
  fallback,
}: {
  src: string;
  fallback: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="text-muted-foreground text-lg font-medium w-full h-full flex items-center justify-center">
        {fallback}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function formatPhone(remoteId: string): string {
  const num = remoteId.replace(/@c\.us$/, '').replace(/\D/g, '');
  return num ? `+${num}` : remoteId;
}

function displayName(contact: { name: string | null; remoteId: string }): string {
  return contact.name?.trim() || formatPhone(contact.remoteId) || contact.remoteId;
}

interface ContactRowProps {
  contact: {
    id: string;
    remoteId: string;
    name: string | null;
    profilePicturePath: string | null;
  };
  onSendNow: (contactId: string, phone: string) => void;
  onSchedule: (contactId: string, phone: string) => void;
}

function ContactRow({ contact, onSendNow, onSchedule }: ContactRowProps) {
  const phone = formatPhone(contact.remoteId);
  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-default transition-colors hover:bg-accent/60"
      role="listitem"
    >
      <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {contact.profilePicturePath ? (
          <ContactAvatar
            src={mediaUrl(contact.profilePicturePath)}
            fallback={displayName(contact).charAt(0).toUpperCase()}
          />
        ) : (
          <span className="text-muted-foreground text-lg font-medium">
            {displayName(contact).charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">
          {displayName(contact)}
        </div>
        <div className="text-xs text-muted-foreground truncate" dir="ltr">
          {phone}
        </div>
      </div>
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          type="button"
          onClick={() => onSendNow(contact.id, phone)}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="שלח עכשיו"
          title="שלח עכשיו"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onSchedule(contact.id, phone)}
          className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          aria-label="תזמן"
          title="תזמן"
        >
          <CalendarClock className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ContactSidebarProps {
  onSendNow?: (contactId: string, phone: string) => void;
  onSchedule?: (contactId: string, phone: string) => void;
}

export function ContactSidebar({
  onSendNow: onSendNowProp,
  onSchedule: onScheduleProp,
}: ContactSidebarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const defaultSendNow = (_contactId: string, phone: string) => {
    navigate(`/send?phone=${encodeURIComponent(phone)}`);
  };
  const defaultSchedule = (id: string, phone: string) => {
    navigate(`/schedule?contactId=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`);
  };

  const onSendNow = onSendNowProp ?? defaultSendNow;
  const onSchedule = onScheduleProp ?? defaultSchedule;

  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list(),
    retry: false,
  });

  const syncMutation = useMutation({
    mutationFn: () => api.contacts.sync(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  return (
    <aside
      className="w-72 flex flex-col border-l border-border bg-card/50 shrink-0"
      aria-label="רשימת אנשי קשר"
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">אנשי קשר</h2>
        <button
          type="button"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="סנכרן אנשי קשר"
          title="סנכרן אנשי קשר מ-WhatsApp"
        >
          <RefreshCw
            className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            טוען...
          </p>
        ) : isError ? (
          <div className="text-sm text-destructive py-4 px-2 text-center space-y-2">
            <p>{error instanceof Error ? error.message : 'שגיאה בטעינה'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-primary underline"
            >
              נסה שוב
            </button>
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            אין אנשי קשר. לחץ על כפתור הסנכרון.
          </p>
        ) : (
          <div className="space-y-0.5" role="list">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onSendNow={onSendNow}
                onSchedule={onSchedule}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
