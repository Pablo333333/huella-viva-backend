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
exports.TramitesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../infrastructure/auth/roles.guard");
const roles_decorator_1 = require("../../infrastructure/auth/roles.decorator");
const client_1 = require("@prisma/client");
const create_tramite_use_case_1 = require("../../application/use-cases/create-tramite.use-case");
const change_tramite_state_use_case_1 = require("../../application/use-cases/change-tramite-state.use-case");
const summarize_tramite_use_case_1 = require("../../application/use-cases/summarize-tramite.use-case");
const create_comment_use_case_1 = require("../../application/use-cases/create-comment.use-case");
const upload_document_use_case_1 = require("../../application/use-cases/upload-document.use-case");
const predictive_service_1 = require("../../infrastructure/predictive/predictive.service");
const ocr_service_1 = require("../../infrastructure/ocr/ocr.service");
const tramite_dto_1 = require("../../application/dtos/tramite.dto");
const tramite_repository_interface_1 = require("../../domain/repositories/tramite.repository.interface");
const comment_repository_interface_1 = require("../../domain/repositories/comment.repository.interface");
const document_repository_interface_1 = require("../../domain/repositories/document.repository.interface");
const common_2 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let TramitesController = class TramitesController {
    createTramiteUseCase;
    changeTramiteStateUseCase;
    summarizeTramiteUseCase;
    createCommentUseCase;
    uploadDocumentUseCase;
    predictiveService;
    ocrService;
    tramiteRepository;
    commentRepository;
    documentRepository;
    constructor(createTramiteUseCase, changeTramiteStateUseCase, summarizeTramiteUseCase, createCommentUseCase, uploadDocumentUseCase, predictiveService, ocrService, tramiteRepository, commentRepository, documentRepository) {
        this.createTramiteUseCase = createTramiteUseCase;
        this.changeTramiteStateUseCase = changeTramiteStateUseCase;
        this.summarizeTramiteUseCase = summarizeTramiteUseCase;
        this.createCommentUseCase = createCommentUseCase;
        this.uploadDocumentUseCase = uploadDocumentUseCase;
        this.predictiveService = predictiveService;
        this.ocrService = ocrService;
        this.tramiteRepository = tramiteRepository;
        this.commentRepository = commentRepository;
        this.documentRepository = documentRepository;
    }
    create(req, createTramiteDto) {
        return this.createTramiteUseCase.execute(req.user.userId, createTramiteDto);
    }
    findAll(q) {
        return this.tramiteRepository.findAll({ q });
    }
    findMy(req) {
        return this.tramiteRepository.findByUser(req.user.userId);
    }
    findOne(id) {
        return this.tramiteRepository.findById(id);
    }
    update(id, updateTramiteDto) {
        const data = {
            ...updateTramiteDto,
            fechaLimite: updateTramiteDto.fechaLimite ? new Date(updateTramiteDto.fechaLimite) : undefined,
        };
        return this.tramiteRepository.update(id, data);
    }
    changeStatus(id, newStateId, req) {
        return this.changeTramiteStateUseCase.execute(id, newStateId, req.user.userId);
    }
    async getSummary(id) {
        const summary = await this.summarizeTramiteUseCase.execute(id);
        return { summary };
    }
    createComment(id, content, req) {
        return this.createCommentUseCase.execute({
            content,
            userId: req.user.userId,
            tramiteId: id,
        });
    }
    getComments(id) {
        return this.commentRepository.findByTramiteId(id);
    }
    uploadFile(id, file, req) {
        return this.uploadDocumentUseCase.execute({
            name: file.originalname,
            url: `/uploads/${file.filename}`,
            type: file.mimetype,
            userId: req.user.userId,
            tramiteId: id,
        });
    }
    getDocuments(id) {
        return this.documentRepository.findByTramiteId(id);
    }
    async analyzeImage(file) {
        const text = await this.ocrService.extractText(file.path);
        if (!text)
            return { error: 'No se pudo extraer texto de la imagen' };
        const suggestions = await this.predictiveService.analyzeDocumentText(text);
        return { ...suggestions, extractedText: text };
    }
    remove(id) {
        return this.tramiteRepository.delete(id);
    }
};
exports.TramitesController = TramitesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tramite_dto_1.CreateTramiteDto]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tramite_dto_1.UpdateTramiteDto]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERVISOR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newStateId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TramitesController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)('analyze-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TramitesController.prototype, "analyzeImage", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TramitesController.prototype, "remove", null);
exports.TramitesController = TramitesController = __decorate([
    (0, common_1.Controller)('tramites'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(7, (0, common_2.Inject)(tramite_repository_interface_1.ITramiteRepository)),
    __param(8, (0, common_2.Inject)(comment_repository_interface_1.ICommentRepository)),
    __param(9, (0, common_2.Inject)(document_repository_interface_1.IDocumentRepository)),
    __metadata("design:paramtypes", [create_tramite_use_case_1.CreateTramiteUseCase,
        change_tramite_state_use_case_1.ChangeTramiteStateUseCase,
        summarize_tramite_use_case_1.SummarizeTramiteUseCase,
        create_comment_use_case_1.CreateCommentUseCase,
        upload_document_use_case_1.UploadDocumentUseCase,
        predictive_service_1.PredictiveService,
        ocr_service_1.OcrService, Object, Object, Object])
], TramitesController);
//# sourceMappingURL=tramites.controller.js.map