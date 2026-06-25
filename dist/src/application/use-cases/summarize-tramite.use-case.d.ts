import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { AiService } from '../../infrastructure/ai/ai.service';
export declare class SummarizeTramiteUseCase {
    private readonly tramiteRepository;
    private readonly commentRepository;
    private readonly aiService;
    constructor(tramiteRepository: ITramiteRepository, commentRepository: ICommentRepository, aiService: AiService);
    execute(tramiteId: string): Promise<string>;
}
