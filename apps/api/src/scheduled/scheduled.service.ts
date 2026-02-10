import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cron = require('node-cron');
import { prisma } from '@whatsapp-web-plus/db';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class ScheduledService {
  private readonly logger = new Logger(ScheduledService.name);
  private cronJob: ReturnType<typeof cron.schedule> | null = null;

  constructor(private readonly whatsApp: WhatsAppService) {}

  onModuleInit() {
    this.whatsApp.initClient();
    this.cronJob = cron.schedule('* * * * *', () => this.tick(), { scheduled: true });
    this.logger.log('Scheduled messages cron started (every minute)');
  }

  onModuleDestroy() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }

  private async tick(): Promise<void> {
    const now = new Date();
    const pending = await prisma.scheduledMessage.findMany({
      where: { status: 'Pending', scheduledAt: { lte: now } },
      orderBy: { scheduledAt: 'asc' },
    });
    for (const msg of pending) {
      await this.dispatch(msg.id, msg.chatId, msg.content);
    }
  }

  async dispatch(
    scheduledId: string,
    chatId: string,
    content: string,
  ): Promise<{ success: boolean; error?: string }> {
    const phone = chatId.includes('@c.us') ? chatId.split('@')[0] : chatId.replace(/\D/g, '');
    const result = this.whatsApp.sendMessage(phone, content);
    const resolved = await result;
    try {
      if (resolved.success) {
        await prisma.scheduledMessage.update({
          where: { id: scheduledId },
          data: { status: 'Sent' },
        });
        this.logger.log(`Scheduled message ${scheduledId} sent to ${chatId}`);
      } else {
        await prisma.scheduledMessage.update({
          where: { id: scheduledId },
          data: { status: 'Failed' },
        });
        this.logger.warn(`Scheduled message ${scheduledId} failed: ${resolved.error}`);
      }
    } catch (e) {
      this.logger.warn(`Update status failed for ${scheduledId}`, (e as Error)?.message);
    }
    return resolved;
  }

  async list() {
    return prisma.scheduledMessage.findMany({
      orderBy: [{ status: 'asc' }, { scheduledAt: 'asc' }],
    });
  }

  async create(data: { content: string; scheduledAt: Date; chatId: string }) {
    const chatId = data.chatId.trim().replace(/\D/g, '').endsWith('@c.us')
      ? data.chatId.trim()
      : `${data.chatId.trim().replace(/\D/g, '')}@c.us`;
    return prisma.scheduledMessage.create({
      data: {
        content: data.content.trim(),
        scheduledAt: data.scheduledAt,
        chatId,
        status: 'Pending',
      },
    });
  }

  async delete(id: string) {
    await prisma.scheduledMessage.deleteMany({ where: { id, status: 'Pending' } });
    return { ok: true };
  }

  async update(id: string, data: { content?: string; scheduledAt?: Date }) {
    const existing = await prisma.scheduledMessage.findFirst({
      where: { id, status: 'Pending' },
    });
    if (!existing) return null;
    return prisma.scheduledMessage.update({
      where: { id },
      data: {
        ...(data.content != null && { content: data.content.trim() }),
        ...(data.scheduledAt != null && { scheduledAt: data.scheduledAt }),
      },
    });
  }
}
