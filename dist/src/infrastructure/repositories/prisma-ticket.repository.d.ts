import { PrismaService } from '../prisma/prisma.service';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { Ticket } from '../../domain/entities/ticket.entity';
export declare class PrismaTicketRepository implements ITicketRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(ticket: Ticket): Promise<Ticket>;
    findById(id: string): Promise<Ticket | null>;
    findAll(filters?: {
        categoryId?: string;
        workflowStateId?: string;
        q?: string;
    }): Promise<Ticket[]>;
    getStats(): Promise<any>;
    update(id: string, ticket: Partial<Ticket>): Promise<Ticket>;
    delete(id: string): Promise<void>;
}
