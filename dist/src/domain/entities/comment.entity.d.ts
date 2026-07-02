export declare class Comment {
    constructor(partial: Partial<Comment>);
    id: string;
    content: string;
    ticketId: string | null;
    userId: string;
    createdAt: Date;
    user?: {
        name: string;
        email: string;
    };
}
