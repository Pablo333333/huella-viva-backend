export declare class Comment {
    id: string;
    content: string;
    ticketId: string | null;
    tramiteId: string | null;
    userId: string;
    createdAt: Date;
    user?: {
        name: string | null;
        email: string;
    };
    constructor(props: Partial<Comment>);
}
