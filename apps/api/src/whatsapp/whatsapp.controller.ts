import { Controller, Get } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsApp: WhatsAppService) {}

  @Get('status')
  status() {
    this.whatsApp.initClient();
    return this.whatsApp.getStatus();
  }
}
