import { Comment } from '../entities/comment.entity';
export interface ICommentRepository {
    create(data: Partial<Comment>): Promise<Comment>;
    findByTicketId(ticketId: string): Promise<Comment[]>;
    findById(id: string): Promise<Comment | null>;
}
export declare const ICommentRepository: unique symbol;
