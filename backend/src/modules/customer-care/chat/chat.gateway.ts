import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  // Lưu trữ userId -> socketId
  private connectedUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Thông thường auth token có thể được gửi qua query hoặc headers để xác thực
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Xóa user khỏi map khi ngắt kết nối
    const userId = client.handshake.query.userId as string;
    if (userId && this.connectedUsers.get(userId) === client.id) {
      this.connectedUsers.delete(userId);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;
    if (roomId) {
      client.join(roomId);
      this.logger.log(`Client ${client.id} joined room: ${roomId}`);
      return { event: 'joinedRoom', data: roomId };
    }
    return { event: 'error', data: 'Room ID is required' };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const { roomId } = payload;
    if (roomId) {
      client.leave(roomId);
      this.logger.log(`Client ${client.id} left room: ${roomId}`);
      return { event: 'leftRoom', data: roomId };
    }
  }
}
