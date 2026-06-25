export declare class Ticket {
    id: string;
    title: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    workflowStateId: string;
    categoryId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    categoryName?: string;
    statusName?: string;
    constructor(props: Partial<Ticket>);
}
