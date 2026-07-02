import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { AuditService } from '../../infrastructure/audit/audit.service';
import { UploadDocumentUseCase } from './upload-document.use-case';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly auditService: AuditService,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
  ) {}

  async execute(dto: CreateTicketDto, userId: string, file?: Express.Multer.File): Promise<Ticket> {
    const ticket = new Ticket({
      title: dto.title,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      userId: userId,
      categoryId: dto.categoryId,
      workflowStateId: dto.workflowStateId,
    });

    const createdTicket = await this.ticketRepository.create(ticket);

    // Si hay un archivo de audio, lo guardamos como documento
    if (file) {
      await this.uploadDocumentUseCase.execute({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        type: file.mimetype,
        userId: userId,
        ticketId: createdTicket.id,
      });
    }

    // Auditoría con Blockchain
    await this.auditService.logAction(createdTicket.id, 'TICKET', { ...dto, userId });

    return createdTicket;
  }
}
