import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';
import { GetChatRoomsUseCase } from './application/use-cases/get-chat-rooms.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly getChatRoomsUseCase: GetChatRoomsUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Lấy danh sách phòng chat của tôi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách phòng chat kèm tin nhắn mới nhất' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async getChatRooms(@GetCurrentUserId() userId: string) {
    return this.getChatRoomsUseCase.execute(userId);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Lấy tin nhắn trong một phòng chat (Tự động đánh dấu đã đọc)' })
  @ApiParam({ name: 'roomId', description: 'ID phòng chat', type: String })
  @ApiResponse({ status: 200, description: 'Danh sách tin nhắn phân trang' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem phòng chat' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng chat' })
  async getMessages(
    @GetCurrentUserId() userId: string,
    @Param('roomId') roomId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.getMessagesUseCase.execute(userId, roomId, pageNum, limitNum);
  }

  @Post('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Gửi tin nhắn (Text, Image, Video)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'roomId', description: 'ID phòng chat', type: String })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Nội dung tin nhắn (Tùy chọn nếu có file)' },
        file: { type: 'string', format: 'binary', description: 'File đính kèm (Tùy chọn, Max 5MB, Ảnh/Video)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Tin nhắn đã được gửi' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ (Quá dung lượng, sai định dạng)' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền gửi hoặc phòng bị khóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phòng chat' })
  @UseInterceptors(FileInterceptor('file'))
  async sendMessage(
    @GetCurrentUserId() userId: string,
    @Param('roomId') roomId: string,
    @Body('content') content?: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^(image\/|video\/)/ }), // Image or Video
        ],
        fileIsRequired: false,
      }),
    ) file?: Express.Multer.File,
  ) {
    return this.sendMessageUseCase.execute(userId, roomId, content, file);
  }
}
