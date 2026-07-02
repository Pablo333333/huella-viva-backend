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
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const create_ticket_use_case_1 = require("../../application/use-cases/create-ticket.use-case");
const change_ticket_state_use_case_1 = require("../../application/use-cases/change-ticket-state.use-case");
const upload_document_use_case_1 = require("../../application/use-cases/upload-document.use-case");
const get_ticket_documents_use_case_1 = require("../../application/use-cases/get-ticket-documents.use-case");
const create_comment_use_case_1 = require("../../application/use-cases/create-comment.use-case");
const get_ticket_comments_use_case_1 = require("../../application/use-cases/get-ticket-comments.use-case");
const generate_document_use_case_1 = require("../../application/use-cases/generate-document.use-case");
const summarize_ticket_conversation_use_case_1 = require("../../application/use-cases/summarize-ticket-conversation.use-case");
const create_ticket_dto_1 = require("../../application/dtos/create-ticket.dto");
const change_ticket_status_dto_1 = require("../../application/dtos/change-ticket-status.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const ticket_repository_interface_1 = require("../../domain/repositories/ticket.repository.interface");
const ticket_history_repository_interface_1 = require("../../domain/repositories/ticket-history.repository.interface");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const ocr_service_1 = require("../../infrastructure/ocr/ocr.service");
const predictive_service_1 = require("../../infrastructure/predictive/predictive.service");
const cloudinary_service_1 = require("../../infrastructure/documents/cloudinary.service");
let TicketsController = class TicketsController {
    createTicketUseCase;
    changeTicketStateUseCase;
    uploadDocumentUseCase;
    getTicketDocumentsUseCase;
    createCommentUseCase;
    getTicketCommentsUseCase;
    generateDocumentUseCase;
    summarizeTicketConversationUseCase;
    prisma;
    ocrService;
    predictiveService;
    cloudinaryService;
    ticketRepository;
    ticketHistoryRepository;
    constructor(createTicketUseCase, changeTicketStateUseCase, uploadDocumentUseCase, getTicketDocumentsUseCase, createCommentUseCase, getTicketCommentsUseCase, generateDocumentUseCase, summarizeTicketConversationUseCase, prisma, ocrService, predictiveService, cloudinaryService, ticketRepository, ticketHistoryRepository) {
        this.createTicketUseCase = createTicketUseCase;
        this.changeTicketStateUseCase = changeTicketStateUseCase;
        this.uploadDocumentUseCase = uploadDocumentUseCase;
        this.getTicketDocumentsUseCase = getTicketDocumentsUseCase;
        this.createCommentUseCase = createCommentUseCase;
        this.getTicketCommentsUseCase = getTicketCommentsUseCase;
        this.generateDocumentUseCase = generateDocumentUseCase;
        this.summarizeTicketConversationUseCase = summarizeTicketConversationUseCase;
        this.prisma = prisma;
        this.ocrService = ocrService;
        this.predictiveService = predictiveService;
        this.cloudinaryService = cloudinaryService;
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
    }
    async create(createTicketDto, user, file) {
        try {
            if (file) {
                console.log(`[Cloudinary] Archivo subido exitosamente: ${file.path}`);
            }
            return await this.createTicketUseCase.execute(createTicketDto, user.userId, file);
        }
        catch (error) {
            console.error('[Cloudinary Error] Fallo en la subida:', error);
            throw new common_1.InternalServerErrorException('El servicio de almacenamiento no está disponible');
        }
    }
    async changeStatus(id, dto, user) {
        return this.changeTicketStateUseCase.execute(id, dto.newStateId, user.userId);
    }
    async findAll(categoryId, workflowStateId, q) {
        if (q) {
            return this.ticketRepository.findAll({ categoryId, workflowStateId, q });
        }
        return this.ticketRepository.findAll({ categoryId, workflowStateId });
    }
    async getStats() {
        return this.ticketRepository.getStats();
    }
    async findOne(id) {
        return this.ticketRepository.findById(id);
    }
    async getHistory(id) {
        return this.ticketHistoryRepository.findByTicketId(id);
    }
    async uploadFile(id, file, user) {
        try {
            console.log(`[Cloudinary] Archivo subido exitosamente: ${file.path}`);
            const existingDoc = await this.prisma.document.findFirst({
                where: {
                    ticketId: id,
                    name: file.originalname,
                    isLatest: true,
                },
            });
            let version = 1;
            if (existingDoc) {
                version = existingDoc.version + 1;
                await this.prisma.document.update({
                    where: { id: existingDoc.id },
                    data: { isLatest: false },
                });
            }
            return this.uploadDocumentUseCase.execute({
                name: file.originalname,
                url: file.path,
                type: file.mimetype,
                userId: user.userId,
                ticketId: id,
                version,
                isLatest: true,
            });
        }
        catch (error) {
            console.error('[Cloudinary Error] Fallo en la subida:', error);
            throw new common_1.InternalServerErrorException('El servicio de almacenamiento no está disponible');
        }
    }
    async getDocuments(id) {
        return this.getTicketDocumentsUseCase.execute(id);
    }
    async createComment(id, content, user) {
        return this.createCommentUseCase.execute({
            content,
            userId: user.userId,
            ticketId: id,
        });
    }
    async getComments(id) {
        return this.getTicketCommentsUseCase.execute(id);
    }
    async summarize(id) {
        return { summary: await this.summarizeTicketConversationUseCase.execute(id) };
    }
    async generatePdf(id, res) {
        const buffer = await this.generateDocumentUseCase.execute(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=ticket-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
    async analyzeImage(file) {
        try {
            const text = await this.ocrService.extractText(file.path);
            if (!text)
                return { error: 'No se pudo extraer texto de la imagen' };
            const suggestions = await this.predictiveService.analyzeDocumentText(text);
            return { ...suggestions, extractedText: text };
        }
        catch (error) {
            console.error('[Cloudinary Error] Fallo en la subida:', error);
            throw new common_1.InternalServerErrorException('El servicio de almacenamiento no está disponible');
        }
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.OPERARIO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: new cloudinary_service_1.CloudinaryService().getStorage('tickets/audio'),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ticket_dto_1.CreateTicketDto, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_ticket_status_dto_1.ChangeTicketStatusDto, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('workflowStateId')),
    __param(2, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: new cloudinary_service_1.CloudinaryService().getStorage('tickets/documents'),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/summarize'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "summarize", null);
__decorate([
    (0, common_1.Get)(':id/generate-pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('analyze-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: new cloudinary_service_1.CloudinaryService().getStorage('temp/ocr'),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "analyzeImage", null);
exports.TicketsController = TicketsController = __decorate([
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(12, (0, common_1.Inject)(ticket_repository_interface_1.ITicketRepository)),
    __param(13, (0, common_1.Inject)(ticket_history_repository_interface_1.ITicketHistoryRepository)),
    __metadata("design:paramtypes", [create_ticket_use_case_1.CreateTicketUseCase,
        change_ticket_state_use_case_1.ChangeTicketStateUseCase,
        upload_document_use_case_1.UploadDocumentUseCase,
        get_ticket_documents_use_case_1.GetTicketDocumentsUseCase,
        create_comment_use_case_1.CreateCommentUseCase,
        get_ticket_comments_use_case_1.GetTicketCommentsUseCase,
        generate_document_use_case_1.GenerateDocumentUseCase,
        summarize_ticket_conversation_use_case_1.SummarizeTicketConversationUseCase,
        prisma_service_1.PrismaService,
        ocr_service_1.OcrService,
        predictive_service_1.PredictiveService,
        cloudinary_service_1.CloudinaryService, Object, Object])
], TicketsController);
//# sourceMappingURL=tickets.controller.js.map