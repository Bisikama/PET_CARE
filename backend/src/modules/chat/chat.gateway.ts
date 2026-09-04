import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: true,
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Trích xuất Token từ header authorization hoặc auth.token
      const authHeader = client.handshake.headers.authorization;
      const authToken = client.handshake.auth?.token;

      let token = authToken;
      if (!token && authHeader) {
        token = authHeader.split(' ')[1];
      }

      if (!token) {
        this.logger.warn(`Client kết nối thất bại (Thiếu Token): ${client.id}`);
        client.disconnect(true);
        return;
      }

      // Giải mã token
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'secret';
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });

      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`Client kết nối thất bại (Token không có userId): ${client.id}`);
        client.disconnect(true);
        return;
      }

      // Lưu thông tin vào client.data
      client.data.userId = userId;

      // Join room cá nhân
      const roomName = `room_user_${userId}`;
      client.join(roomName);

      this.logger.log(`Client kết nối thành công: ${client.id} - Join room: ${roomName}`);
    } catch (error) {
      this.logger.error(`Lỗi xác thực Token cho client ${client.id}: ${error.message}`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('chat.message_send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto
  ) {
    try {
      const userId = client.data.userId;
      
      // 1. Lưu tin nhắn vào DB
      const result = await this.chatService.saveMessage(userId, dto);
      
      const messagePayload = {
        id: result.message.id,
        roomId: result.message.chat_room_id,
        senderId: result.message.sender_id,
        content: result.message.content,
        createdAt: result.message.created_at,
      };

      // 2. Bắn sự kiện tức thời (Real-time) sang cho người nhận
      const receiverRoom = `room_user_${result.receiverId}`;
      this.server.to(receiverRoom).emit('chat.message_received', messagePayload);
      
      // Cũng gửi lại cho sender để cập nhật UI nếu cần
      const senderRoom = `room_user_${userId}`;
      this.server.to(senderRoom).emit('chat.message_received', messagePayload);

      this.logger.log(`User ${userId} gửi tin nhắn đến room ${dto.roomId} (Receiver: ${result.receiverId})`);
    } catch (error) {
      this.logger.error(`Lỗi gửi tin nhắn từ client ${client.id}: ${error.message}`);
      // Có thể emit lỗi lại cho client
      client.emit('chat.error', { message: error.message });
    }
  }
}
