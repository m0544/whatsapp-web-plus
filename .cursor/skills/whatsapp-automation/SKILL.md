---
name: whatsapp-automation
description: Expertise in whatsapp-web.js event handling, Puppeteer sessions, and message formatting. Use when working with WhatsApp automation, whatsapp-web.js, Puppeteer for WhatsApp, message events, or message formatting in WhatsApp bots.
---

# WhatsApp Automation

## Overview

This skill provides guidance for whatsapp-web.js (Node.js WhatsApp Web API), including event handling, Puppeteer session/auth configuration, and message formatting conventions.

## Event Handling

### Connection lifecycle events

Register handlers on the `Client` instance. Core events:

| Event | When | Typical use |
|-------|------|-------------|
| `qr` | QR code needed to link device | Generate data URL (e.g. with `qrcode`), show in UI |
| `ready` | Client connected and ready | Clear QR UI, enable send/receive |
| `authenticated` | Auth succeeded, session restoring | Optional: show "connecting" |
| `auth_failure` | Auth failed | Clear QR, set disconnected |
| `disconnected` | Session ended or lost | Clear QR, set disconnected |

Example:

```ts
client.on("qr", async (qr: string) => {
  const dataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
  setQrDataUrl(dataUrl);
});
client.on("ready", () => {
  setConnectionStatus("ready");
  setQrDataUrl(null);
});
client.on("auth_failure", () => {
  setConnectionStatus("disconnected");
  setQrDataUrl(null);
});
```

### Message events

For receiving messages:

- `message` — any incoming message (text, media, etc.)
- `message_create` — message created (includes outgoing)

Handler receives a `Message` object. Use `message.from` (chat ID), `message.body` (text), `message.hasMedia`, `message.downloadMedia()` as needed. Always check connection status before sending; only send when status is `"ready"`.

## Puppeteer sessions

### Client setup

Use dynamic import for whatsapp-web.js in Node-only code (e.g. API routes or server libs) to avoid bundling Puppeteer in the client:

```ts
const { Client, LocalAuth } = await import("whatsapp-web.js");
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: authPath }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
```

### Auth and session persistence

- **LocalAuth**: Stores session under `dataPath` (e.g. `.wwebjs_auth`). Use a path under `process.cwd()` or a fixed app data dir.
- Single long-lived client: Create the client once and reuse (e.g. a module-level `clientPromise`) so the same Puppeteer/session is used across requests.
- Do not create a new `Client` per request; reuse one initialized client.

### Puppeteer options

- `headless: true` for servers; `false` only for local debugging.
- Include `--no-sandbox` and `--disable-setuid-sandbox` when running in restricted/Docker environments to avoid launch failures.

## Message formatting and sending

### Chat ID format

- User chats: `{number}@c.us` (number = digits only, with country code, no `+` or spaces).
- Normalize before sending: `const normalized = phone.replace(/\D/g, ""); const chatId = normalized.includes("@c.us") ? normalized : `${normalized}@c.us`;`

### Sending text

```ts
await client.sendMessage(chatId, content);
```

- `content` is a string (plain text). For templates or quick replies, pass the final string (e.g. from DB) as `content`.
- Always ensure connection status is `"ready"` before calling `sendMessage`; return a clear error to the user if not connected.

### Errors

Catch errors from `sendMessage` and map to user-facing messages (e.g. "WhatsApp לא מחובר" when not connected, or a generic send failure). Prefer `err instanceof Error ? err.message : "fallback"` for error text.

## Checklist for new automation code

- [ ] Use a single shared client instance (no new Client per request).
- [ ] Handle `qr`, `ready`, `auth_failure`, `disconnected` (and optionally `authenticated`).
- [ ] Normalize phone to digits and append `@c.us` for user chat IDs.
- [ ] Check connection status before any send; return structured `{ success, error? }`.
- [ ] Use dynamic import for whatsapp-web.js in server-only code.
