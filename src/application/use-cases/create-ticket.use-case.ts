import { CreateTicketDto } from '../dtos/create-ticket.dto';
import { Ticket } from '../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { AuditService } from '../../infrastructure/audit/audit.service';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(dto: CreateTicketDto, userId: string): Promise<Ticket> {
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

    // Auditoría con Blockchain
    await this.auditService.logAction(createdTicket.id, 'TICKET', { ...dto, userId });

    return createdTicket;
  }
}
