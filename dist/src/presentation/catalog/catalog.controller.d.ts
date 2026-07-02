import { PrismaService } from '../../infrastructure/prisma/prisma.service';
export declare class CatalogController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCategories(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    getWorkflowStates(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }[]>;
    getUsers(): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
}
