import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ScheduledService } from './scheduled.service';

@Controller('scheduled')
export class ScheduledController {
  constructor(private readonly scheduled: ScheduledService) {}

  @Get()
  async list() {
    try {
      return await this.scheduled.list();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה בטעינת התזמונים', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() body: { content?: string; scheduledAt?: string; contactId?: string },
  ) {
    const content = body.content?.trim();
    const contactId = body.contactId?.trim();
    if (!content || !contactId) {
      throw new HttpException(
        { error: 'נדרשים תוכן, תאריך/שעה ומגע (contactId)' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      throw new HttpException(
        { error: 'תאריך/שעה לא תקין (scheduledAt ISO string)' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (scheduledAt <= new Date()) {
      throw new HttpException(
        { error: 'זמן השליחה חייב להיות בעתיד' },
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.scheduled.create({ content, scheduledAt, contactId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה בשמירת התזמון', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { content?: string; scheduledAt?: string },
  ) {
    const data: { content?: string; scheduledAt?: Date } = {};
    if (body.content != null) data.content = body.content.trim();
    if (body.scheduledAt != null) {
      const d = new Date(body.scheduledAt);
      if (Number.isNaN(d.getTime())) {
        throw new HttpException({ error: 'תאריך לא תקין' }, HttpStatus.BAD_REQUEST);
      }
      data.scheduledAt = d;
    }
    try {
      const updated = await this.scheduled.update(id, data);
      if (!updated) {
        throw new HttpException(
          { error: 'לא נמצא או שההודעה כבר נשלחה' },
          HttpStatus.NOT_FOUND,
        );
      }
      return updated;
    } catch (e) {
      if (e instanceof HttpException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה בעדכון', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.scheduled.delete(id);
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה במחיקה', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
