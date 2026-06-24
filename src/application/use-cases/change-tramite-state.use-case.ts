import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';

@Injectable()
export class ChangeTramiteStateUseCase {
  constructor(
    @Inject(ITramiteRepository)
    private readonly tramiteRepository: ITramiteRepository,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async execute(tramiteId: string, newStateId: string, userId: string): Promise<void> {
    const tramite = await this.tramiteRepository.findById(tramiteId);

    if (!tramite) {
      throw new NotFoundException('Tramite not found');
    }

    const oldStateId = tramite.estadoId;

    // Obtener el nombre del nuevo estado para la notificación
    const newState = await this.prisma.workflowState.findUnique({
      where: { id: newStateId },
    });

    // Actualizar el tramite
    await this.tramiteRepository.update(tramiteId, {
      estadoId: newStateId,
    });

    // Registrar en el historial
    await this.prisma.tramiteHistory.create({
      data: {
        tramiteId,
        oldStateId,
        newStateId,
        userId,
      },
    });

    // Emitir evento real-time
    this.socketGateway.emitToRoom(tramiteId, 'statusChanged', {
      tramiteId,
      newStateId,
      newStateName: newState?.name,
    });

    // Notificar al destinatario del trámite si el cambio lo hizo otra persona
    if (tramite.destinatarioId && userId !== tramite.destinatarioId) {
      await this.notificationService.notifyStateChange(
        tramite.destinatarioId,
        'Tramite',
        tramiteId,
        newState?.name || 'Nuevo Estado'
      );
    }
  }
}
