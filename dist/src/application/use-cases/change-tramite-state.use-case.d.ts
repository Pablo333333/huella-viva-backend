import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';
import { AuditService } from '../../infrastructure/audit/audit.service';
export declare class ChangeTramiteStateUseCase {
    private readonly tramiteRepository;
    private readonly prisma;
    private readonly notificationService;
    private readonly socketGateway;
    private readonly auditService;
    constructor(tramiteRepository: ITramiteRepository, prisma: PrismaService, notificationService: NotificationService, socketGateway: SocketGateway, auditService: AuditService);
    execute(tramiteId: string, newStateId: string, userId: string): Promise<void>;
}
