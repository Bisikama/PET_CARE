import { Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendMessageDto, MessageReceivedDto, BookingUpdatedDto } from './dto/chat.dto';

@ApiTags('WebSockets Documentation')
@Controller('ws/docs')
@Public()
export class ChatDocsController {
  
  @Post('chat-message-send')
  @ApiOperation({ summary: '1. Emit `chat.message_send` (Client -> Server)' })
  @ApiResponse({
    status: 201,
    description: 'Payload mà Client cần truyền lên khi gọi sự kiện `chat.message_send`.',
    type: SendMessageDto
  })
  dummySendMessage() {}

  @Post('chat-message-received')
  @ApiOperation({ summary: '2. Listen `chat.message_received` (Server -> Client)' })
  @ApiResponse({
    status: 200,
    description: 'Payload mà Server sẽ bắn về Client khi có tin nhắn mới.',
    type: MessageReceivedDto
  })
  dummyMessageReceived() {}

  @Post('booking-updated')
  @ApiOperation({ summary: '3. Listen `booking.updated` (Server -> Client)' })
  @ApiResponse({
    status: 200,
    description: 'Payload mà Server sẽ bắn về Client khi trạng thái của một Booking bị thay đổi.',
    type: BookingUpdatedDto
  })
  dummyBookingUpdated() {}
}
