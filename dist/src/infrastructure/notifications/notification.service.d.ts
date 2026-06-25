import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService {
    private readonly prisma;
    private readonly logger;
    private expo;
    constructor(prisma: PrismaService);
    sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void>;
    notifyStateChange(userId: string, entityType: string, entityId: string, newState: string): Promise<void>;
    registerToken(userId: string, token: string): Promise<void>;
}
