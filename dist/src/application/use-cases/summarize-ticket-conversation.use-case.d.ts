import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { AiService } from '../../infrastructure/ai/ai.service';
export declare class SummarizeTicketConversationUseCase {
    private readonly commentRepository;
    private readonly aiService;
    constructor(commentRepository: ICommentRepository, aiService: AiService);
    execute(ticketId: string): Promise<string>;
}
