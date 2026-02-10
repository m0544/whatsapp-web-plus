import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contacts: ContactsService,
    private readonly whatsApp: WhatsAppService,
  ) {}

  @Get()
  async list() {
    try {
      return await this.contacts.list();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה בטעינת אנשי קשר', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sync')
  async sync() {
    try {
      return await this.whatsApp.syncContacts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new HttpException(
        { error: 'שגיאה בסנכרון אנשי קשר', details: msg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
