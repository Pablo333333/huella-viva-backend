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
exports.PrismaDocumentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_entity_1 = require("../../domain/entities/document.entity");
let PrismaDocumentRepository = class PrismaDocumentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(document) {
        const created = await this.prisma.document.create({
            data: {
                name: document.name,
                url: document.url,
                type: document.type,
                userId: document.userId,
                ticketId: document.ticketId,
                tramiteId: document.tramiteId,
            },
        });
        return new document_entity_1.Document(created);
    }
    async findById(id) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
        });
        return doc ? new document_entity_1.Document(doc) : null;
    }
    async findByTicketId(ticketId) {
        const docs = await this.prisma.document.findMany({
            where: { ticketId },
            orderBy: { createdAt: 'desc' },
        });
        return docs.map((d) => new document_entity_1.Document(d));
    }
    async findByTramiteId(tramiteId) {
        const docs = await this.prisma.document.findMany({
            where: { tramiteId },
            orderBy: { createdAt: 'desc' },
        });
        return docs.map((d) => new document_entity_1.Document(d));
    }
    async updateExtractedText(id, text) {
        await this.prisma.document.update({
            where: { id },
            data: { extractedText: text },
        });
    }
    async delete(id) {
        await this.prisma.document.delete({
            where: { id },
        });
    }
};
exports.PrismaDocumentRepository = PrismaDocumentRepository;
exports.PrismaDocumentRepository = PrismaDocumentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDocumentRepository);
//# sourceMappingURL=prisma-document.repository.js.map