/**
 * API client using fetch. Base URL is proxied in dev (/api -> API server).
 * Contract types from @whatsapp-web-plus/contracts are used for type safety.
 */
import type { QuickReply, WhatsAppStatusResponse } from '@whatsapp-web-plus/contracts';

const baseUrl = import.meta.env.VITE_API_URL ?? '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, { credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
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

export const api = {
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
    create: (body: { content: string; scheduledAt: string; chatId: string }) =>
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
  chatId: string;
  status: string;
  createdAt: string;
};
