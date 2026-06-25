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
exports.CreateCommentUseCase = void 0;
const common_1 = require("@nestjs/common");
const comment_repository_interface_1 = require("../../domain/repositories/comment.repository.interface");
const comment_entity_1 = require("../../domain/entities/comment.entity");
const socket_gateway_1 = require("../../infrastructure/socket/socket.gateway");
let CreateCommentUseCase = class CreateCommentUseCase {
    commentRepository;
    socketGateway;
    constructor(commentRepository, socketGateway) {
        this.commentRepository = commentRepository;
        this.socketGateway = socketGateway;
    }
    async execute(data) {
        const comment = new comment_entity_1.Comment({
            content: data.content,
            userId: data.userId,
            ticketId: data.ticketId,
            tramiteId: data.tramiteId,
        });
        const createdComment = await this.commentRepository.create(comment);
        const roomId = data.ticketId || data.tramiteId;
        if (roomId) {
            this.socketGateway.emitToRoom(roomId, 'messageReceived', createdComment);
        }
        return createdComment;
    }
};
exports.CreateCommentUseCase = CreateCommentUseCase;
exports.CreateCommentUseCase = CreateCommentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(comment_repository_interface_1.ICommentRepository)),
    __metadata("design:paramtypes", [Object, socket_gateway_1.SocketGateway])
], CreateCommentUseCase);
//# sourceMappingURL=create-comment.use-case.js.map