import { Injectable } from '@nestjs/common';
import { prisma } from '@whatsapp-web-plus/db';

@Injectable()
export class ContactsService {
  async list() {
    return prisma.contact.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { scheduledMessages: true } } },
    });
  }
}
