/**
 * API client using fetch. Base URL is proxied in dev (/api -> API server).
 * Contract types from @whatsapp-web-plus/contracts are used for type safety.
 */
import type { QuickReply, WhatsAppStatusResponse } from '@whatsapp-web-plus/contracts';

const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

function parseJsonOrThrow(text: string): void {
  if (text.trim().startsWith('<')) {
    throw new Error(
      'השרת לא מגיב ב-JSON (קיבלנו HTML). וודא שה-API רץ: npm run dev:api בפורט 3001.',
    );
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { credentials: 'include' });
  const text = await res.text();
  if (!res.ok) {
    parseJsonOrThrow(text);
    const err = JSON.parse(text) as { error?: string };
    throw new Error(err.error ?? res.statusText);
  }
  parseJsonOrThrow(text);
  return JSON.parse(text) as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    parseJsonOrThrow(text);
    const err = JSON.parse(text) as { error?: string };
    throw new Error(err.error ?? res.statusText);
  }
  parseJsonOrThrow(text);
  return JSON.parse(text) as T;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const text = await res.text();
  if (!res.ok) {
    parseJsonOrThrow(text);
    const err = JSON.parse(text) as { error?: string };
    throw new Error(err.error ?? res.statusText);
  }
}

export type ChatItem = {
  id: string;
  remoteId: string;
  name: string | null;
  updatedAt: string;
  _count: { messages: number };
};

export type MessageItem = {
  id: string;
  body: string | null;
  fromMe: boolean;
  mediaType: string | null;
  mediaPath: string | null;
  timestamp: string;
};

export function mediaUrl(filename: string): string {
  return `${baseUrl}/media/${encodeURIComponent(filename)}`;
}

export type ContactItem = {
  id: string;
  remoteId: string;
  name: string | null;
  profilePicturePath: string | null;
  updatedAt: string;
  _count: { scheduledMessages: number };
};

export const api = {
  contacts: {
    list: () => get<ContactItem[]>('/contacts'),
    sync: () => post<{ synced: number; error?: string }>('/contacts/sync', {}),
  },
  quickReplies: {
    list: () => get<QuickReply[]>('/quick-replies'),
    create: (body: { shortcut: string; content: string }) =>
      post<QuickReply>('/quick-replies', body),
    delete: (id: string) => del(`/quick-replies/${id}`),
  },
  send: {
    post: (body: { phone: string; content?: string; templateId?: string }) =>
      post<{ ok: true }>('/send', body),
  },
  whatsapp: {
    status: () => get<WhatsAppStatusResponse>('/whatsapp/status'),
  },
  chats: {
    list: () => get<ChatItem[]>('/chats'),
    messages: (chatId: string, params?: { limit?: number; cursor?: string }) => {
      const sp = new URLSearchParams();
      if (params?.limit) sp.set('limit', String(params.limit));
      if (params?.cursor) sp.set('cursor', params.cursor);
      const q = sp.toString();
      return get<{ items: MessageItem[]; nextCursor: string | null }>(
        `/chats/${chatId}/messages${q ? `?${q}` : ''}`,
      );
    },
  },
  scheduled: {
    list: () => get<ScheduledItem[]>('/scheduled'),
    create: (body: { content: string; scheduledAt: string; contactId: string }) =>
      post<ScheduledItem>('/scheduled', body),
    update: (id: string, body: { content?: string; scheduledAt?: string }) =>
      fetch(`${baseUrl}/scheduled/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error('עדכון נכשל');
        return res.json();
      }) as Promise<ScheduledItem>,
    delete: (id: string) => del(`/scheduled/${id}`),
  },
};

export type ScheduledItem = {
  id: string;
  content: string;
  scheduledAt: string;
  contactId: string;
  contact: { id: string; remoteId: string; name: string | null };
  status: string;
  createdAt: string;
};
