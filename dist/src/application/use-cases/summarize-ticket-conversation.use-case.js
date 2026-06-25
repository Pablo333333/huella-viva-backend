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
exports.SummarizeTicketConversationUseCase = void 0;
const common_1 = require("@nestjs/common");
const comment_repository_interface_1 = require("../../domain/repositories/comment.repository.interface");
const ai_service_1 = require("../../infrastructure/ai/ai.service");
let SummarizeTicketConversationUseCase = class SummarizeTicketConversationUseCase {
    commentRepository;
    aiService;
    constructor(commentRepository, aiService) {
        this.commentRepository = commentRepository;
        this.aiService = aiService;
    }
    async execute(ticketId) {
        const comments = await this.commentRepository.findByTicketId(ticketId);
        if (comments.length === 0) {
            return 'No hay comentarios suficientes para generar un resumen.';
        }
        const conversationText = comments
            .map(c => `${c.user?.name || 'Usuario'}: ${c.content}`)
            .join('\n');
        return this.aiService.summarize(conversationText);
    }
};
exports.SummarizeTicketConversationUseCase = SummarizeTicketConversationUseCase;
exports.SummarizeTicketConversationUseCase = SummarizeTicketConversationUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(comment_repository_interface_1.ICommentRepository)),
    __metadata("design:paramtypes", [Object, ai_service_1.AiService])
], SummarizeTicketConversationUseCase);
//# sourceMappingURL=summarize-ticket-conversation.use-case.js.map