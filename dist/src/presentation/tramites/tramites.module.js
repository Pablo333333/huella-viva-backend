"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TramitesModule = void 0;
const common_1 = require("@nestjs/common");
const tramites_controller_1 = require("./tramites.controller");
const create_tramite_use_case_1 = require("../../application/use-cases/create-tramite.use-case");
const change_tramite_state_use_case_1 = require("../../application/use-cases/change-tramite-state.use-case");
const summarize_tramite_use_case_1 = require("../../application/use-cases/summarize-tramite.use-case");
const create_comment_use_case_1 = require("../../application/use-cases/create-comment.use-case");
const upload_document_use_case_1 = require("../../application/use-cases/upload-document.use-case");
const tramite_repository_interface_1 = require("../../domain/repositories/tramite.repository.interface");
const comment_repository_interface_1 = require("../../domain/repositories/comment.repository.interface");
const document_repository_interface_1 = require("../../domain/repositories/document.repository.interface");
const prisma_tramite_repository_1 = require("../../infrastructure/repositories/prisma-tramite.repository");
const prisma_comment_repository_1 = require("../../infrastructure/repositories/prisma-comment.repository");
const prisma_document_repository_1 = require("../../infrastructure/repositories/prisma-document.repository");
const prisma_module_1 = require("../../infrastructure/prisma/prisma.module");
const ai_module_1 = require("../../infrastructure/ai/ai.module");
const ocr_module_1 = require("../../infrastructure/ocr/ocr.module");
const predictive_module_1 = require("../../infrastructure/predictive/predictive.module");
const audit_module_1 = require("../../infrastructure/audit/audit.module");
let TramitesModule = class TramitesModule {
};
exports.TramitesModule = TramitesModule;
exports.TramitesModule = TramitesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, ai_module_1.AiModule, ocr_module_1.OcrModule, predictive_module_1.PredictiveModule, audit_module_1.AuditModule],
        controllers: [tramites_controller_1.TramitesController],
        providers: [
            create_tramite_use_case_1.CreateTramiteUseCase,
            change_tramite_state_use_case_1.ChangeTramiteStateUseCase,
            summarize_tramite_use_case_1.SummarizeTramiteUseCase,
            create_comment_use_case_1.CreateCommentUseCase,
            upload_document_use_case_1.UploadDocumentUseCase,
            {
                provide: tramite_repository_interface_1.ITramiteRepository,
                useClass: prisma_tramite_repository_1.PrismaTramiteRepository,
            },
            {
                provide: comment_repository_interface_1.ICommentRepository,
                useClass: prisma_comment_repository_1.PrismaCommentRepository,
            },
            {
                provide: document_repository_interface_1.IDocumentRepository,
                useClass: prisma_document_repository_1.PrismaDocumentRepository,
            },
        ],
        exports: [tramite_repository_interface_1.ITramiteRepository],
    })
], TramitesModule);
//# sourceMappingURL=tramites.module.js.map