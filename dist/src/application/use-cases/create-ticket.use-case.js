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
exports.CreateTicketUseCase = void 0;
const ticket_entity_1 = require("../../domain/entities/ticket.entity");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../../infrastructure/audit/audit.service");
let CreateTicketUseCase = class CreateTicketUseCase {
    ticketRepository;
    auditService;
    constructor(ticketRepository, auditService) {
        this.ticketRepository = ticketRepository;
        this.auditService = auditService;
    }
    async execute(dto, userId) {
        const ticket = new ticket_entity_1.Ticket({
            title: dto.title,
            description: dto.description,
            latitude: dto.latitude,
            longitude: dto.longitude,
            userId: userId,
            categoryId: dto.categoryId,
            workflowStateId: dto.workflowStateId,
        });
        const createdTicket = await this.ticketRepository.create(ticket);
        await this.auditService.logAction(createdTicket.id, 'TICKET', { ...dto, userId });
        return createdTicket;
    }
};
exports.CreateTicketUseCase = CreateTicketUseCase;
exports.CreateTicketUseCase = CreateTicketUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __metadata("design:paramtypes", [Object, audit_service_1.AuditService])
], CreateTicketUseCase);
//# sourceMappingURL=create-ticket.use-case.js.map