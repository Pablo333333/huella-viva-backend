import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    logAction(entityId: string, entityType: string, payload: any): Promise<void>;
    verifyIntegrity(entityId: string): Promise<{
        isValid: boolean;
        chain: any[];
    }>;
}
