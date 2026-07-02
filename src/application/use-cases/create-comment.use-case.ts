import { Injectable, Inject } from '@nestjs/common';
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

  async execute(data: { content: string; userId: string; ticketId: string }): Promise<Comment> {
    const comment = await this.commentRepository.create({
      content: data.content,
      userId: data.userId,
      ticketId: data.ticketId,
    });

    // Notificar vía Socket.io
    this.socketGateway.server.to(data.ticketId).emit('messageReceived', comment);

    return comment;
  }
}
