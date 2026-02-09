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
};
