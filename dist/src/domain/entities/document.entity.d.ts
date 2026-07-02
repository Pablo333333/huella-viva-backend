export declare class Document {
    constructor(partial: Partial<Document>);
    id: string;
    name: string;
    url: string;
    type: string | null;
    version: number;
    isLatest: boolean;
    extractedText: string | null;
    userId: string;
    ticketId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
