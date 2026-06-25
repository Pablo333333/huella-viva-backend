import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { AuditService } from '../../infrastructure/audit/audit.service';
export declare class CreateTicketUseCase {
    private readonly ticketRepository;
    private readonly auditService;
    constructor(ticketRepository: ITicketRepository, auditService: AuditService);
    execute(dto: CreateTicketDto, userId: string): Promise<Ticket>;
}
