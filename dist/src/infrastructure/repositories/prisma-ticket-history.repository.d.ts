import { PrismaService } from '../prisma/prisma.service';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { TicketHistory } from '../../domain/entities/ticket-history.entity';
export declare class PrismaTicketHistoryRepository implements ITicketHistoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(history: TicketHistory): Promise<TicketHistory>;
    findByTicketId(ticketId: string): Promise<TicketHistory[]>;
}
