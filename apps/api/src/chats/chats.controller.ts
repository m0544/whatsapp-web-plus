import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { prisma } from '@whatsapp-web-plus/db';

@Controller('chats')
export class ChatsController {
  @Get()
  async list() {
    try {
      const chats = await prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' },
      });
      const withCount = await Promise.all(
        chats.map(async (chat) => {
          const count = await prisma.message.count({ where: { chatId: chat.id } });
          return { ...chat, _count: { messages: count } };
        }),
      );
      return withCount;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('no such table') || msg.includes('Chat')) {
        return [];
      }
      throw new HttpException(
        { error: 'שגיאה בטעינת השיחות', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/messages')
  async listMessages(
    @Param('id') id: string,
    @Query('limit') limitStr?: string,
    @Query('cursor') cursor?: string,
  ) {
    try {
      const limit = Math.min(Number(limitStr) || 50, 100);
      const messages = await prisma.message.findMany({
        where: { chatId: id },
        orderBy: { timestamp: 'asc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });
      const nextCursor = messages.length > limit ? messages[limit - 1]?.id : null;
      const items = messages.slice(0, limit);
      return { items, nextCursor };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה בטעינת הודעות', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
