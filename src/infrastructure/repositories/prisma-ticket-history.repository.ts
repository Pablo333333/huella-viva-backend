import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { TicketHistory } from '../../domain/entities/ticket-history.entity';

@Injectable()
export class PrismaTicketHistoryRepository implements ITicketHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(history: TicketHistory): Promise<TicketHistory> {
    const created = await this.prisma.ticketHistory.create({
      data: {
        ticketId: history.ticketId,
        oldStateId: history.oldStateId,
        newStateId: history.newStateId,
        userId: history.userId,
      },
    });

    return new TicketHistory(created);
  }

  async findByTicketId(ticketId: string): Promise<TicketHistory[]> {
    const history = await this.prisma.ticketHistory.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return history.map((h) => new TicketHistory(h));
  }
}
