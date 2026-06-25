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
exports.SummarizeTramiteUseCase = void 0;
const common_1 = require("@nestjs/common");
const tramite_repository_interface_1 = require("../../domain/repositories/tramite.repository.interface");
const comment_repository_interface_1 = require("../../domain/repositories/comment.repository.interface");
const ai_service_1 = require("../../infrastructure/ai/ai.service");
let SummarizeTramiteUseCase = class SummarizeTramiteUseCase {
    tramiteRepository;
    commentRepository;
    aiService;
    constructor(tramiteRepository, commentRepository, aiService) {
        this.tramiteRepository = tramiteRepository;
        this.commentRepository = commentRepository;
        this.aiService = aiService;
    }
    async execute(tramiteId) {
        const tramite = await this.tramiteRepository.findById(tramiteId);
        if (!tramite) {
            throw new common_1.NotFoundException('Tramite not found');
        }
        const comments = await this.commentRepository.findByTramiteId(tramiteId);
        let textToSummarize = `Trámite: ${tramite.tipo}\nEstado: ${tramite.estadoName}\n`;
        textToSummarize += `Remitente: ${tramite.remitenteName}\nDestinatario: ${tramite.destinatarioName}\n`;
        if (comments.length > 0) {
            textToSummarize += '\nComentarios:\n';
            comments.forEach(c => {
                textToSummarize += `- ${c.content}\n`;
            });
        }
        else {
            textToSummarize += '\nSin comentarios adicionales.';
        }
        return this.aiService.summarize(textToSummarize);
    }
};
exports.SummarizeTramiteUseCase = SummarizeTramiteUseCase;
exports.SummarizeTramiteUseCase = SummarizeTramiteUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tramite_repository_interface_1.ITramiteRepository)),
    __param(1, (0, common_1.Inject)(comment_repository_interface_1.ICommentRepository)),
    __metadata("design:paramtypes", [Object, Object, ai_service_1.AiService])
], SummarizeTramiteUseCase);
//# sourceMappingURL=summarize-tramite.use-case.js.map