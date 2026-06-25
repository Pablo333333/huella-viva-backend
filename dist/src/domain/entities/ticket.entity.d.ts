export declare class Ticket {
    id: string;
    title: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    workflowStateId: string;
    categoryId: string;
    userId: string;
    priority: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    categoryName?: string;
    statusName?: string;
    documents?: any[];
    constructor(props: Partial<Ticket>);
}
