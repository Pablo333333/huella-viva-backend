import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
export declare class GetTicketCommentsUseCase {
    private readonly commentRepository;
    constructor(commentRepository: ICommentRepository);
    execute(ticketId: string): Promise<Comment[]>;
}
