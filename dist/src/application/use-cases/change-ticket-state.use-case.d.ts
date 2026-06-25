import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../../infrastructure/audit/audit.service';
export declare class ChangeTicketStateUseCase {
    private readonly ticketRepository;
    private readonly ticketHistoryRepository;
    private readonly notificationService;
    private readonly socketGateway;
    private readonly prisma;
    private readonly auditService;
    constructor(ticketRepository: ITicketRepository, ticketHistoryRepository: ITicketHistoryRepository, notificationService: NotificationService, socketGateway: SocketGateway, prisma: PrismaService, auditService: AuditService);
    execute(ticketId: string, newStateId: string, userId: string): Promise<void>;
}
