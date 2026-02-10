import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const QRCode = require('qrcode');
import { prisma } from '@whatsapp-web-plus/db';
import {
  getConnectionStatus,
  getQrDataUrl,
  setConnectionStatus,
  setQrDataUrl,
} from './whatsapp.store';

type ClientInstance = Awaited<ReturnType<typeof createClient>>;

let clientPromise: Promise<ClientInstance> | null = null;

function getAuthPath(): string {
  return path.join(__dirname, '..', '..', '.wwebjs_auth');
}

function getMediaDir(): string {
  const root = path.resolve(__dirname, '..', '..', '..', '..');
  const dir = path.join(root, 'media');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function createClient(logger: Logger) {
  const { Client, LocalAuth } = await import('whatsapp-web.js');
  const authPath = getAuthPath();
  logger.log(`WhatsApp client auth path: ${authPath}`);

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    },
  });

  client.on('qr', async (qr: string) => {
    setConnectionStatus('connecting');
    try {
      const dataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
      setQrDataUrl(dataUrl);
      logger.log('QR code received and set');
    } catch (err) {
      logger.warn('QR toDataURL failed', err);
      setQrDataUrl(null);
    }
  });

  client.on('ready', () => {
    setConnectionStatus('ready');
    setQrDataUrl(null);
  });

  client.on('authenticated', () => {
    setConnectionStatus('connecting');
  });

  client.on('auth_failure', () => {
    setConnectionStatus('disconnected');
    setQrDataUrl(null);
  });

  client.on('disconnected', (reason) => {
    setConnectionStatus('disconnected');
    logger.warn('WhatsApp disconnected', reason);
  });

  const saveMessage = async (msg: {
    from: string;
    to?: string;
    id?: { _serialized?: string; id?: string };
    body?: string;
    fromMe?: boolean;
    hasMedia?: boolean;
    downloadMedia?: () => Promise<{ data: string; mimetype?: string } | null>;
    getContact?: () => Promise<{ name?: string; pushname?: string }>;
    getChat?: () => Promise<{ name?: string }>;
  }) => {
    try {
      const chatId = msg.fromMe ? (msg.to || msg.from) : msg.from;
      const remoteMsgId = msg.id?._serialized ?? msg.id?.id ?? `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const existing = await prisma.message.findFirst({
        where: { remoteId: remoteMsgId },
      });
      if (existing) return;

      let chat = await prisma.chat.findUnique({ where: { remoteId: chatId } });
      if (!chat) {
        let name: string | null = null;
        try {
          if (msg.getChat) {
            const chatObj = await msg.getChat();
            name = chatObj?.name ?? null;
          }
          if (!name && msg.getContact) {
            const contact = await msg.getContact();
            name = contact?.name ?? contact?.pushname ?? null;
          }
        } catch (_) {}
        chat = await prisma.chat.create({
          data: { remoteId: chatId, name: name ?? undefined },
        });
      } else {
        await prisma.chat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        });
      }

      let mediaType: string | null = null;
      let mediaPath: string | null = null;
      if (msg.hasMedia && msg.downloadMedia) {
        try {
          const media = await msg.downloadMedia();
          if (media?.data) {
            const ext = media.mimetype?.split('/')[1] ?? 'bin';
            const safe = remoteMsgId.replace(/[^a-zA-Z0-9.-]/g, '_');
            const mediaDir = getMediaDir();
            const filename = `${safe}.${ext}`;
            const filePath = path.join(mediaDir, filename);
            fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));
            mediaType = media.mimetype ?? 'application/octet-stream';
            mediaPath = filename;
          }
        } catch (e) {
          logger.warn('Media download failed', (e as Error)?.message);
        }
      }

      await prisma.message.create({
        data: {
          chatId: chat.id,
          remoteId: remoteMsgId,
          body: msg.body ?? null,
          fromMe: msg.fromMe ?? false,
          mediaType,
          mediaPath,
        },
      });
      logger.log(`Message saved: ${msg.fromMe ? 'outgoing' : 'incoming'} to ${chatId}`);
    } catch (e) {
      logger.warn('Save message failed', (e as Error)?.message);
    }
  };

  client.on('message', saveMessage);
  client.on('message_create', saveMessage);

  return client;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  async getClient(): Promise<ClientInstance> {
    if (!clientPromise) {
      clientPromise = createClient(this.logger);
    }
    return clientPromise;
  }

  initClient(): void {
    if (getConnectionStatus() === 'ready') return;
    setConnectionStatus('connecting');
    this.logger.log('WhatsApp initClient: starting…');
    this.getClient()
      .then((client) => {
        if (getConnectionStatus() === 'ready') return;
        this.logger.log('WhatsApp client created, calling initialize()');
        client.initialize().catch((err) => {
          this.logger.warn('WhatsApp initialize() failed', err?.message ?? err);
          setConnectionStatus('disconnected');
          setQrDataUrl(null);
        });
      })
      .catch((err) => {
        this.logger.error('WhatsApp getClient() failed', err?.message ?? err);
        setConnectionStatus('disconnected');
        setQrDataUrl(null);
      });
  }

  getStatus() {
    return {
      status: getConnectionStatus(),
      qr: getQrDataUrl() ?? undefined,
    };
  }

  async sendMessage(
    phone: string,
    content: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (getConnectionStatus() !== 'ready') {
      return { success: false, error: 'WhatsApp לא מחובר' };
    }
    try {
      const client = await this.getClient();
      const normalized = phone.replace(/\D/g, '');
      if (!normalized) {
        return { success: false, error: 'מספר לא תקין' };
      }
      const chatId = normalized.includes('@c.us')
        ? normalized
        : `${normalized}@c.us`;
      await client.sendMessage(chatId, content);
      await this.saveOutgoingMessage(chatId, content);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בשליחה';
      return { success: false, error: message };
    }
  }

  async saveOutgoingMessage(chatId: string, body: string): Promise<void> {
    try {
      let chat = await prisma.chat.findUnique({ where: { remoteId: chatId } });
      if (!chat) {
        chat = await prisma.chat.create({
          data: { remoteId: chatId, name: chatId },
        });
      } else {
        await prisma.chat.update({
          where: { id: chat.id },
          data: { updatedAt: new Date() },
        });
      }
      const remoteMsgId = `out_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      await prisma.message.create({
        data: {
          chatId: chat.id,
          remoteId: remoteMsgId,
          body,
          fromMe: true,
        },
      });
      this.logger.log(`Outgoing message saved to chat ${chatId}`);
    } catch (e) {
      this.logger.warn('saveOutgoingMessage failed', (e as Error)?.message);
    }
  }
}
