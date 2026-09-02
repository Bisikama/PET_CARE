import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client connected without token: ${client.id}`);
        client.disconnect();
        return;
      }

      const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || process.env.JWT_ACCESS_SECRET;
      const payload = await this.jwtService.verifyAsync(token, { secret: accessSecret });

      const userId = payload.sub;
      if (!userId) {
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      const userRoom = `user_${userId}`;
      await client.join(userRoom);

      this.logger.log(`Client ${client.id} authenticated for user: ${userId}, joined room ${userRoom}`);
    } catch (error) {
      this.logger.error(`WebSocket connection auth failed for client ${client.id}: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id} (user: ${client.data?.userId})`);
  }

  sendToUser(userId: string, event: string, data: any): boolean {
    if (!this.server) {
      this.logger.warn('WebSocket Server not initialized yet');
      return false;
    }
    const userRoom = `user_${userId}`;
    this.logger.log(`Emitting event "${event}" to room: ${userRoom}`);
    this.server.to(userRoom).emit(event, data);
    return true;
  }

  sendToAll(event: string, data: any): boolean {
    if (!this.server) return false;
    this.server.emit(event, data);
    return true;
  }

  private extractToken(client: Socket): string | null {
    // 1. Check auth payload (Socket.io standard: socket = io({ auth: { token: '...' } }))
    const authHeader = client.handshake.auth?.token || client.handshake.auth?.Authorization;
    if (authHeader) {
      return authHeader.replace(/^Bearer\s+/i, '').trim();
    }

    // 2. Check headers
    const headerAuth = client.handshake.headers?.authorization;
    if (headerAuth) {
      return headerAuth.replace(/^Bearer\s+/i, '').trim();
    }

    // 3. Check query param (e.g. ?token=...)
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken) {
      return queryToken.replace(/^Bearer\s+/i, '').trim();
    }

    return null;
  }
}
