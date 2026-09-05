import { Controller, Get, Post, Param, Query, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post(':roomId/media')
  @ApiOperation({ summary: 'Tải lên hình ảnh hoặc video vào phòng chat' })
  @ApiResponse({ status: 201, description: 'Tải lên thành công và tạo tin nhắn mới.' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc quá lớn.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền gửi tin nhắn vào phòng này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng chat.' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @GetCurrentUserId() userId: string,
    @Param('roomId') roomId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max for video
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|mp4|mov|avi)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const { message, receiverId } = await this.chatService.saveMediaMessage(userId, roomId, file);
    // Note: To broadcast this via socket, ideally the client listens to REST response and emits a socket event,
    // OR we inject the gateway here. However, avoiding circular dependency is better.
    // In our architecture, the client can just emit a "chat.media_sent" over WS if we had it, but since
    // uploading large files over WS is bad, we do REST upload -> Return Message -> Client emits "chat.message_sent" 
    // with the returned message object.
    return { success: true, message, receiverId };
  }
}
