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
                priority: ticket.priority || 'BAJA',
                isArchived: ticket.isArchived || false,
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
        if (!filters?.includeArchived) {
            where.isArchived = false;
        }
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
                documents: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (tickets.length > 0) {
            console.log('[PrismaTicketRepository] First ticket structure:', JSON.stringify(tickets[0], null, 2));
        }
        return tickets.map((t) => new ticket_entity_1.Ticket({
            ...t,
            categoryName: t.category.name,
            statusName: t.status.name,
            documents: t.documents,
        }));
    }
    async getStats() {
        console.log('[PrismaTicketRepository] Fetching full analytics stats...');
        const allTickets = await this.prisma.ticket.findMany({
            include: {
                status: true,
                category: true,
                user: true,
            }
        });
        console.log(`[PrismaTicketRepository] Total tickets found for analytics: ${allTickets.length}`);
        const kpis = {
            total: allTickets.length,
            pending: allTickets.filter(t => t.status && ['NUEVO', 'EN_PROCESO'].includes(t.status.name.toUpperCase())).length,
            completed: allTickets.filter(t => t.status && (t.status.name.toUpperCase() === 'CERRADO' || t.status.name.toUpperCase() === 'COMPLETADO')).length,
            urgent: allTickets.filter(t => t.priority && ['URGENTE', 'MEDIA'].includes(t.priority.toUpperCase())).length,
        };
        const categoryMap = {};
        allTickets.forEach(t => {
            const name = t.category?.name || 'Sin Categoría';
            categoryMap[name] = (categoryMap[name] || 0) + 1;
        });
        const byCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
        const userMap = {};
        allTickets.forEach(t => {
            const name = t.user?.name || 'Usuario Desconocido';
            userMap[name] = (userMap[name] || 0) + 1;
        });
        const byUser = Object.entries(userMap).map(([name, tickets]) => ({ name, tickets }));
        const evolution = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            const creados = allTickets.filter(t => new Date(t.createdAt) >= date && new Date(t.createdAt) < nextDate).length;
            const cerrados = allTickets.filter(t => new Date(t.updatedAt) >= date && new Date(t.updatedAt) < nextDate &&
                (t.status.name.toUpperCase() === 'CERRADO' || t.status.name.toUpperCase() === 'COMPLETADO')).length;
            evolution.push({
                name: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                creados,
                cerrados
            });
        }
        const result = { kpis, byCategory, byUser, evolution };
        console.log('[PrismaTicketRepository] Analytics result:', JSON.stringify(result, null, 2));
        return result;
    }
    async update(id, ticket) {
        const updated = await this.prisma.ticket.update({
            where: { id },
            data: {
                title: ticket.title,
                description: ticket.description,
                workflowStateId: ticket.workflowStateId,
                categoryId: ticket.categoryId,
                priority: ticket.priority,
                isArchived: ticket.isArchived,
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