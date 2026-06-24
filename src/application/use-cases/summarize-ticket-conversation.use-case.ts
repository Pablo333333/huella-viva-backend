import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { AiService } from '../../infrastructure/ai/ai.service';

@Injectable()
export class SummarizeTicketConversationUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly aiService: AiService,
  ) {}

  async execute(ticketId: string): Promise<string> {
    const comments = await this.commentRepository.findByTicketId(ticketId);

    if (comments.length === 0) {
      return 'No hay comentarios suficientes para generar un resumen.';
    }

    const conversationText = comments
      .map(c => `${c.user?.name || 'Usuario'}: ${c.content}`)
      .join('\n');

    return this.aiService.summarize(conversationText);
  }
}
