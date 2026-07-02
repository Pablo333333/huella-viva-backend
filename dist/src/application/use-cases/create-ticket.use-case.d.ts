import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { AuditService } from '../../infrastructure/audit/audit.service';
import { UploadDocumentUseCase } from './upload-document.use-case';
export declare class CreateTicketUseCase {
    private readonly ticketRepository;
    private readonly auditService;
    private readonly uploadDocumentUseCase;
    constructor(ticketRepository: ITicketRepository, auditService: AuditService, uploadDocumentUseCase: UploadDocumentUseCase);
    execute(dto: CreateTicketDto, userId: string, file?: Express.Multer.File): Promise<Ticket>;
}
