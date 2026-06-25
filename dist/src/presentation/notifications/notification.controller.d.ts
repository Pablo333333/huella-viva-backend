import { NotificationService } from '../../infrastructure/notifications/notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    registerToken(req: any, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
