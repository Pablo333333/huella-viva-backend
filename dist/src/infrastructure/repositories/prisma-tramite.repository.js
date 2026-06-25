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
exports.PrismaTramiteRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tramite_entity_1 = require("../../domain/entities/tramite.entity");
let PrismaTramiteRepository = class PrismaTramiteRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const tramite = await this.prisma.tramite.create({
            data: {
                tipo: data.tipo,
                remitenteId: data.remitenteId,
                destinatarioId: data.destinatarioId,
                estadoId: data.estadoId,
                fechaLimite: data.fechaLimite,
            },
            include: {
                remitente: true,
                destinatario: true,
                estado: true,
            },
        });
        return this.mapToEntity(tramite);
    }
    async findAll(filters) {
        const where = {};
        if (filters?.q) {
            where.OR = [
                { tipo: { equals: filters.q } },
                { remitente: { name: { contains: filters.q, mode: 'insensitive' } } },
                { destinatario: { name: { contains: filters.q, mode: 'insensitive' } } },
                { documents: { some: { extractedText: { contains: filters.q, mode: 'insensitive' } } } },
            ];
        }
        const tramites = await this.prisma.tramite.findMany({
            where,
            include: {
                remitente: true,
                destinatario: true,
                estado: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return tramites.map(this.mapToEntity);
    }
    async findById(id) {
        const tramite = await this.prisma.tramite.findUnique({
            where: { id },
            include: {
                remitente: true,
                destinatario: true,
                estado: true,
            },
        });
        return tramite ? this.mapToEntity(tramite) : null;
    }
    async update(id, data) {
        const tramite = await this.prisma.tramite.update({
            where: { id },
            data: {
                tipo: data.tipo,
                destinatarioId: data.destinatarioId,
                estadoId: data.estadoId,
                fechaLimite: data.fechaLimite,
            },
            include: {
                remitente: true,
                destinatario: true,
                estado: true,
            },
        });
        return this.mapToEntity(tramite);
    }
    async delete(id) {
        await this.prisma.tramite.delete({ where: { id } });
    }
    async findByUser(userId) {
        const tramites = await this.prisma.tramite.findMany({
            where: {
                OR: [
                    { remitenteId: userId },
                    { destinatarioId: userId },
                ],
            },
            include: {
                remitente: true,
                destinatario: true,
                estado: true,
            },
        });
        return tramites.map(this.mapToEntity);
    }
    mapToEntity(t) {
        return new tramite_entity_1.Tramite(t.id, t.tipo, t.remitenteId, t.destinatarioId, t.estadoId, t.createdAt, t.updatedAt, t.fechaLimite, t.remitente?.name || undefined, t.destinatario?.name || undefined, t.estado?.name || undefined);
    }
};
exports.PrismaTramiteRepository = PrismaTramiteRepository;
exports.PrismaTramiteRepository = PrismaTramiteRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTramiteRepository);
//# sourceMappingURL=prisma-tramite.repository.js.map