import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';

@Injectable()
export class GetTicketCommentsUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(ticketId: string): Promise<Comment[]> {
    return this.commentRepository.findByTicketId(ticketId);
  }
}
