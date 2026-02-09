import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
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
    // Don't clear QR so user can still scan if the connection dropped briefly
  });

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
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'שגיאה בשליחה';
      return { success: false, error: message };
    }
  }
}
