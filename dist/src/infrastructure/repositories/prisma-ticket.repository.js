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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTicketRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ticket_entity_1 = require("../../domain/entities/ticket.entity");
let PrismaTicketRepository = class PrismaTicketRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(ticket) {
        const created = await this.prisma.ticket.create({
            data: {
                title: ticket.title,
                description: ticket.description,
                latitude: ticket.latitude,
                longitude: ticket.longitude,
                userId: ticket.userId,
                categoryId: ticket.categoryId,
                workflowStateId: ticket.workflowStateId,
            },
        });
        return new ticket_entity_1.Ticket(created);
    }
    async findById(id) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                category: true,
                status: true,
            },
        });
        if (!ticket)
            return null;
        return new ticket_entity_1.Ticket({
            ...ticket,
            categoryName: ticket.category.name,
            statusName: ticket.status.name,
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.categoryId)
            where.categoryId = filters.categoryId;
        if (filters?.workflowStateId)
            where.workflowStateId = filters.workflowStateId;
        if (filters?.q) {
            where.OR = [
                { title: { contains: filters.q, mode: 'insensitive' } },
                { description: { contains: filters.q, mode: 'insensitive' } },
                { documents: { some: { extractedText: { contains: filters.q, mode: 'insensitive' } } } },
            ];
        }
        const tickets = await this.prisma.ticket.findMany({
            where,
            include: {
                category: true,
                status: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return tickets.map((t) => new ticket_entity_1.Ticket({
            ...t,
            categoryName: t.category.name,
            statusName: t.status.name,
        }));
    }
    async getStats() {
        const byCategory = await this.prisma.ticket.groupBy({
            by: ['categoryId'],
            _count: { _all: true },
        });
        const byUser = await this.prisma.ticket.groupBy({
            by: ['userId'],
            _count: { _all: true },
        });
        const last7Days = await this.prisma.ticket.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            select: {
                createdAt: true,
                workflowStateId: true,
            },
        });
        return { byCategory, byUser, last7Days };
    }
    async update(id, ticket) {
        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                title: ticket.title,
                description: ticket.description,
                workflowStateId: ticket.workflowStateId,
                categoryId: ticket.categoryId,
            },
        });
        return new ticket_entity_1.Ticket(updated);
    }
    async delete(id) {
        await this.prisma.ticket.delete({
            where: { id },
        });
    }
};
exports.PrismaTicketRepository = PrismaTicketRepository;
exports.PrismaTicketRepository = PrismaTicketRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTicketRepository);
//# sourceMappingURL=prisma-ticket.repository.js.map