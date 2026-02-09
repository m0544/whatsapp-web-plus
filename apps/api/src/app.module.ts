import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { QuickRepliesModule } from './quick-replies/quick-replies.module';
import { SendModule } from './send/send.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [DbModule, QuickRepliesModule, SendModule, WhatsAppModule],
})
export class AppModule {}
