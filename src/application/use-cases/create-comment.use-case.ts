import { Inject, Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { SocketGateway } from '../../infrastructure/socket/socket.gateway';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(ICommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly socketGateway: SocketGateway,
  ) {}

  async execute(data: { content: string; userId: string; ticketId?: string; tramiteId?: string }): Promise<Comment> {
    const comment = new Comment({
      content: data.content,
      userId: data.userId,
      ticketId: data.ticketId,
      tramiteId: data.tramiteId,
    });

    const createdComment = await this.commentRepository.create(comment);

    // Emitir evento real-time
    const roomId = data.ticketId || data.tramiteId;
    if (roomId) {
      this.socketGateway.emitToRoom(roomId, 'messageReceived', createdComment);
    }

    return createdComment;
  }
}
