import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../database/prisma.module';
import { StorageModule } from '../../storage/storage.module';
import { GrowthModule } from '../../growth/growth.module';
import { ChatController } from './chat.controller';
import { GetChatRoomsUseCase } from './application/use-cases/get-chat-rooms.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';

@Module({
  imports: [PrismaModule, StorageModule, GrowthModule],
  controllers: [ChatController],
  providers: [
    GetChatRoomsUseCase,
    GetMessagesUseCase,
    SendMessageUseCase,
  ],
  exports: [],
})
export class ChatModule {}
