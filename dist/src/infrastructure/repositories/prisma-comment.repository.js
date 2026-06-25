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
exports.PrismaCommentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const comment_entity_1 = require("../../domain/entities/comment.entity");
let PrismaCommentRepository = class PrismaCommentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(comment) {
        const created = await this.prisma.comment.create({
            data: {
                content: comment.content,
                ticketId: comment.ticketId,
                tramiteId: comment.tramiteId,
                userId: comment.userId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return new comment_entity_1.Comment(created);
    }
    async findByTicketId(ticketId) {
        const comments = await this.prisma.comment.findMany({
            where: { ticketId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return comments.map((c) => new comment_entity_1.Comment(c));
    }
    async findByTramiteId(tramiteId) {
        const comments = await this.prisma.comment.findMany({
            where: { tramiteId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return comments.map((c) => new comment_entity_1.Comment(c));
    }
};
exports.PrismaCommentRepository = PrismaCommentRepository;
exports.PrismaCommentRepository = PrismaCommentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCommentRepository);
//# sourceMappingURL=prisma-comment.repository.js.map