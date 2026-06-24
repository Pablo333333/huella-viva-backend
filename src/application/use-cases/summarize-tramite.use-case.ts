import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { AiService } from '../../infrastructure/ai/ai.service';

@Injectable()
export class SummarizeTramiteUseCase {
  constructor(
    @Inject(ITramiteRepository)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly aiService: AiService,
  ) {}

  async execute(tramiteId: string): Promise<string> {
    const tramite = await this.tramiteRepository.findById(tramiteId);
    if (!tramite) {
      throw new NotFoundException('Tramite not found');
    }

    const comments = await this.commentRepository.findByTramiteId(tramiteId);
    
    let textToSummarize = `Trámite: ${tramite.tipo}\nEstado: ${tramite.estadoName}\n`;
    textToSummarize += `Remitente: ${tramite.remitenteName}\nDestinatario: ${tramite.destinatarioName}\n`;
    
    if (comments.length > 0) {
      textToSummarize += '\nComentarios:\n';
      comments.forEach(c => {
        textToSummarize += `- ${c.content}\n`;
      });
    } else {
      textToSummarize += '\nSin comentarios adicionales.';
    }

    return this.aiService.summarize(textToSummarize);
  }
}
