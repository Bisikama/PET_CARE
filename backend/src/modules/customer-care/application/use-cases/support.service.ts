import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CreateTicketDto, ReplyTicketDto } from '../../dto/support.dto';
import { support_ticket_status } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    return this.prisma.support_tickets.create({
      data: {
        user_id: userId,
        category: dto.category,
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async getMyTickets(userId: string) {
    return this.prisma.support_tickets.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async replyTicket(userId: string, ticketId: string, dto: ReplyTicketDto, isAdmin = false) {
    const ticket = await this.prisma.support_tickets.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    
    if (!isAdmin && ticket.user_id !== userId) {
      throw new ForbiddenException('You are not authorized to reply to this ticket');
    }

    if (ticket.status === support_ticket_status.CLOSED) {
      throw new ForbiddenException('Cannot reply to a CLOSED ticket');
    }

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.support_ticket_messages.create({
        data: {
          ticket_id: ticketId,
          sender_id: userId,
          content: dto.content,
        },
      });

      // Automatically reopen the ticket if a user replies to a RESOLVED ticket
      if (!isAdmin && ticket.status === support_ticket_status.RESOLVED) {
        await tx.support_tickets.update({
          where: { id: ticketId },
          data: { status: support_ticket_status.OPEN },
        });
      }

      return message;
    });
  }

  async getAllTicketsAdmin() {
    return this.prisma.support_tickets.findMany({
      orderBy: { created_at: 'desc' },
      include: { user: { select: { fullName: true, email: true } } },
    });
  }

  async updateTicketStatus(adminId: string, ticketId: string, status: support_ticket_status) {
    return this.prisma.support_tickets.update({
      where: { id: ticketId },
      data: { 
        status,
        ...(status === support_ticket_status.RESOLVED ? { resolved_at: new Date() } : {}),
      },
    });
  }
}
