import { Module } from '@nestjs/common';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { SendController } from './send.controller';

@Module({
  imports: [WhatsAppModule],
  controllers: [SendController],
})
export class SendModule {}
