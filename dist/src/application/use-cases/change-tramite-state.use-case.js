"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeTramiteStateUseCase = void 0;
const common_1 = require("@nestjs/common");
const tramite_repository_interface_1 = require("../../domain/repositories/tramite.repository.interface");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const notification_service_1 = require("../../infrastructure/notifications/notification.service");
const socket_gateway_1 = require("../../infrastructure/socket/socket.gateway");
const audit_service_1 = require("../../infrastructure/audit/audit.service");
let ChangeTramiteStateUseCase = class ChangeTramiteStateUseCase {
    tramiteRepository;
    prisma;
    notificationService;
    socketGateway;
    auditService;
    constructor(tramiteRepository, prisma, notificationService, socketGateway, auditService) {
        this.tramiteRepository = tramiteRepository;
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.socketGateway = socketGateway;
        this.auditService = auditService;
    }
    async execute(tramiteId, newStateId, userId) {
        const tramite = await this.tramiteRepository.findById(tramiteId);
        if (!tramite) {
            throw new common_1.NotFoundException('Tramite not found');
        }
        const oldStateId = tramite.estadoId;
        const newState = await this.prisma.workflowState.findUnique({
            where: { id: newStateId },
        });
        const oldState = await this.prisma.workflowState.findUnique({
            where: { id: oldStateId },
        });
        await this.tramiteRepository.update(tramiteId, {
            estadoId: newStateId,
        });
        await this.prisma.tramiteHistory.create({
            data: {
                tramiteId,
                oldStateId,
                newStateId,
                userId,
            },
        });
        await this.auditService.logAction(tramiteId, 'Tramite', {
            action: 'STATE_CHANGE',
            oldStatus: oldState?.name,
            newStatus: newState?.name,
            timestamp: new Date().toISOString(),
            responsibleId: userId,
        });
        this.socketGateway.emitToRoom(tramiteId, 'statusChanged', {
            tramiteId,
            newStateId,
            newStateName: newState?.name,
        });
        if (tramite.destinatarioId && userId !== tramite.destinatarioId) {
            await this.notificationService.notifyStateChange(tramite.destinatarioId, 'Tramite', tramiteId, newState?.name || 'Nuevo Estado');
        }
    }
};
exports.ChangeTramiteStateUseCase = ChangeTramiteStateUseCase;
exports.ChangeTramiteStateUseCase = ChangeTramiteStateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tramite_repository_interface_1.ITramiteRepository)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        notification_service_1.NotificationService,
        socket_gateway_1.SocketGateway,
        audit_service_1.AuditService])
], ChangeTramiteStateUseCase);
//# sourceMappingURL=change-tramite-state.use-case.js.map