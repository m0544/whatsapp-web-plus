import { Module } from '@nestjs/common';
import { ScheduledController } from './scheduled.controller';
import { ScheduledService } from './scheduled.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  controllers: [ScheduledController],
  providers: [ScheduledService],
})
export class ScheduledModule {}
