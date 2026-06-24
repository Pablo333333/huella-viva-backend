import { Comment } from '../entities/comment.entity';

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findByTicketId(ticketId: string): Promise<Comment[]>;
  findByTramiteId(tramiteId: string): Promise<Comment[]>;
}

export const ICommentRepository = Symbol('ICommentRepository');
