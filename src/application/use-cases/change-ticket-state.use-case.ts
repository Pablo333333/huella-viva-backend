import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.interface';
import { ITicketHistoryRepository } from '../../domain/repositories/ticket-history.repository.interface';
import { TicketHistory } from '../../domain/entities/ticket-history.entity';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../../infrastructure/audit/audit.service';

@Injectable()
export class ChangeTicketStateUseCase {
  constructor(
    @Inject(ITicketRepository)
    private readonly ticketRepository: ITicketRepository,
    @Inject(ITicketHistoryRepository)
    private readonly ticketHistoryRepository: ITicketHistoryRepository,
    private readonly notificationService: NotificationService,
    private readonly socketGateway: SocketGateway,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async execute(ticketId: string, newStateId: string, userId: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const oldStateId = ticket.workflowStateId;

    // Obtener el nombre del nuevo estado
    const newState = await this.prisma.workflowState.findUnique({
      where: { id: newStateId },
    });

    const oldState = await this.prisma.workflowState.findUnique({
      where: { id: oldStateId },
    });

    // Actualizar el ticket
    const isArchived = newState?.name === 'CERRADO';
    
    await this.ticketRepository.update(ticketId, {
      workflowStateId: newStateId,
      isArchived,
    });

    // Registrar en el historial
    const history = new TicketHistory({
      ticketId,
      oldStateId,
      newStateId,
      userId,
    });

    await this.ticketHistoryRepository.create(history);

    // Trazabilidad Blockchain/AuditLog
    await this.auditService.logAction(ticketId, 'Ticket', {
      action: 'STATE_CHANGE',
      oldStatus: oldState?.name,
      newStatus: newState?.name,
      timestamp: new Date().toISOString(),
      responsibleId: userId,
    });

    // Emitir evento real-time
    this.socketGateway.emitToRoom(ticketId, 'statusChanged', {
      ticketId,
      newStateId,
      newStateName: newState?.name,
    });

    // Notificar al creador del ticket si el cambio lo hizo otra persona
    if (ticket.userId && userId !== ticket.userId) {
      await this.notificationService.notifyStateChange(
        ticket.userId,
        'Ticket',
        ticketId,
        newState?.name || 'Nuevo Estado'
      );
    }
  }
}
