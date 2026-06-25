import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';
export declare class CreateCommentUseCase {
    private readonly commentRepository;
    private readonly socketGateway;
    constructor(commentRepository: ICommentRepository, socketGateway: SocketGateway);
    execute(data: {
        content: string;
        userId: string;
        ticketId?: string;
        tramiteId?: string;
    }): Promise<Comment>;
}
