import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { PRISMA } from '../db/db.module';
import type { PrismaClient } from '@whatsapp-web-plus/db';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Controller('send')
export class SendController {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly whatsApp: WhatsAppService,
  ) {}

  @Post()
  async post(
    @Body()
    body: { phone?: string; content?: string; templateId?: string },
  ) {
    try {
      let messageContent = body.content?.trim();
      if (body.templateId && !messageContent) {
        const template = await this.prisma.quickReply.findUnique({
          where: { id: body.templateId },
        });
        messageContent = template?.content ?? '';
      }
      if (!body.phone?.trim() || !messageContent) {
        throw new HttpException(
          { error: 'נדרשים מספר טלפון ותוכן הודעה (או templateId)' },
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.whatsApp.sendMessage(
        body.phone.trim(),
        messageContent,
      );
      if (!result.success) {
        throw new HttpException(
          { error: result.error ?? 'שליחה נכשלה' },
          HttpStatus.BAD_REQUEST,
        );
      }
      return { ok: true };
    } catch (e) {
      if (e instanceof HttpException) throw e;
      console.error(e);
      throw new HttpException(
        { error: 'שגיאה בשליחת ההודעה' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
