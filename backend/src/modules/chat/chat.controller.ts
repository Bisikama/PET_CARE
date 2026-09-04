import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { PaginationDto } from './dto/chat.dto';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';

@ApiTags('Chat History')
@Controller('api/chat/rooms')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các phòng chat (kèm tin nhắn mới nhất)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách phòng chat.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async getMyRooms(@GetCurrentUserId() userId: string) {
    return this.chatService.getMyRooms(userId);
  }

  @Get(':roomId/messages')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn của một phòng chat' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tin nhắn có phân trang.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập vào phòng chat này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng chat.' })
  async getRoomMessages(
    @GetCurrentUserId() userId: string,
    @Param('roomId') roomId: string,
    @Query() query: PaginationDto
  ) {
    return this.chatService.getRoomMessages(userId, roomId, query.page, query.limit);
  }
}
