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
exports.ChangeTicketStateUseCase = void 0;
const common_1 = require("@nestjs/common");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const ticket_history_repository_interface_1 = require("../../domain/repositories/ticket-history.repository.interface");
const ticket_history_entity_1 = require("../../domain/entities/ticket-history.entity");
const notification_service_1 = require("../../infrastructure/notifications/notification.service");
const socket_gateway_1 = require("../../infrastructure/socket/socket.gateway");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const audit_service_1 = require("../../infrastructure/audit/audit.service");
let ChangeTicketStateUseCase = class ChangeTicketStateUseCase {
    ticketRepository;
    ticketHistoryRepository;
    notificationService;
    socketGateway;
    prisma;
    auditService;
    constructor(ticketRepository, ticketHistoryRepository, notificationService, socketGateway, prisma, auditService) {
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.notificationService = notificationService;
        this.socketGateway = socketGateway;
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async execute(ticketId, newStateId, userId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new common_1.NotFoundException('Ticket not found');
        }
        const oldStateId = ticket.workflowStateId;
        const newState = await this.prisma.workflowState.findUnique({
            where: { id: newStateId },
        });
        const oldState = await this.prisma.workflowState.findUnique({
            where: { id: oldStateId },
        });
        await this.ticketRepository.update(ticketId, {
            workflowStateId: newStateId,
        });
        const history = new ticket_history_entity_1.TicketHistory({
            ticketId,
            oldStateId,
            newStateId,
            userId,
        });
        await this.ticketHistoryRepository.create(history);
        await this.auditService.logAction(ticketId, 'Ticket', {
            action: 'STATE_CHANGE',
            oldStatus: oldState?.name,
            newStatus: newState?.name,
            timestamp: new Date().toISOString(),
            responsibleId: userId,
        });
        this.socketGateway.emitToRoom(ticketId, 'statusChanged', {
            ticketId,
            newStateId,
            newStateName: newState?.name,
        });
        if (ticket.userId && userId !== ticket.userId) {
            await this.notificationService.notifyStateChange(ticket.userId, 'Ticket', ticketId, newState?.name || 'Nuevo Estado');
        }
    }
};
exports.ChangeTicketStateUseCase = ChangeTicketStateUseCase;
exports.ChangeTicketStateUseCase = ChangeTicketStateUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __param(1, (0, common_1.Inject)(ticket_history_repository_interface_1.ITicketHistoryRepository)),
    __metadata("design:paramtypes", [Object, Object, notification_service_1.NotificationService,
        socket_gateway_1.SocketGateway,
        prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ChangeTicketStateUseCase);
//# sourceMappingURL=change-ticket-state.use-case.js.map