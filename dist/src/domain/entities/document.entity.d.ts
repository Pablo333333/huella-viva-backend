export declare class Document {
    id: string;
    name: string;
    url: string;
    type: string | null;
    extractedText: string | null;
    userId: string;
    ticketId: string | null;
    tramiteId: string | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(props: Partial<Document>);
}
