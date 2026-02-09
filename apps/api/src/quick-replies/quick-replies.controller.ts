import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { PRISMA } from '../db/db.module';
import type { PrismaClient } from '@whatsapp-web-plus/db';

@Controller('quick-replies')
export class QuickRepliesController {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  @Get()
  async list() {
    try {
      return await this.prisma.quickReply.findMany({
        orderBy: { shortcut: 'asc' },
      });
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'שגיאה בטעינת התבניות';
      const hint = msg.includes('table') || msg.includes('SQLITE') ? ' הרץ: npm run db:migrate' : '';
      throw new HttpException(
        { error: `שגיאה בטעינת התבניות: ${msg}${hint}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: { shortcut?: string; content?: string }) {
    try {
      const shortcut = body.shortcut?.trim();
      const content = body.content?.trim();
      if (!shortcut || !content) {
        throw new HttpException(
          { error: 'נדרשים shortcut ותוכן' },
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.prisma.quickReply.create({
        data: { shortcut, content },
      });
    } catch (e) {
      if (e instanceof HttpException) throw e;
      console.error(e);
      const message =
        e instanceof Error ? e.message : 'שגיאה בשמירת התבנית';
      const hint =
        message.includes('table') || message.includes('SQLITE')
          ? ' ייתכן שצריך להריץ מיגרציות: npm run db:migrate'
          : '';
      throw new HttpException(
        { error: `שגיאה בשמירת התבנית: ${message}${hint}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.prisma.quickReply.delete({ where: { id } });
      return { ok: true };
    } catch (e) {
      console.error(e);
      throw new HttpException(
        { error: 'שגיאה במחיקת התבנית' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
