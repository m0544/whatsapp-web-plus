import { Module } from '@nestjs/common';
import { ChatsModule } from './chats/chats.module';
import { DbModule } from './db/db.module';
import { MediaModule } from './media/media.module';
import { QuickRepliesModule } from './quick-replies/quick-replies.module';
import { ScheduledModule } from './scheduled/scheduled.module';
import { SendModule } from './send/send.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    DbModule,
    QuickRepliesModule,
    SendModule,
    WhatsAppModule,
    ChatsModule,
    MediaModule,
    ScheduledModule,
  ],
})
export class AppModule {}
