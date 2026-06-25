"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const expo_server_sdk_1 = require("expo-server-sdk");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    expo;
    constructor(prisma) {
        this.prisma = prisma;
        this.expo = new expo_server_sdk_1.Expo();
    }
    async sendPushNotification(userId, title, body, data) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { pushToken: true },
            });
            if (!user || !user.pushToken) {
                this.logger.warn(`User ${userId} not found or has no push token`);
                return;
            }
            if (!expo_server_sdk_1.Expo.isExpoPushToken(user.pushToken)) {
                this.logger.error(`Push token ${user.pushToken} is not a valid Expo push token`);
                return;
            }
            const messages = [{
                    to: user.pushToken,
                    sound: 'default',
                    title,
                    body,
                    data: data || {},
                }];
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets = [];
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                    this.logger.log(`Sent push notification chunk to user ${userId}`);
                }
                catch (error) {
                    this.logger.error(`Error sending push notification chunk: ${error.message}`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error in sendPushNotification for user ${userId}: ${error.message}`);
        }
    }
    async notifyStateChange(userId, entityType, entityId, newState) {
        const title = `Actualización de ${entityType}`;
        const body = `El ${entityType.toLowerCase()} con ID ${entityId.substring(0, 8)} ha cambiado a estado: ${newState}`;
        await this.sendPushNotification(userId, title, body, {
            entityId,
            entityType,
            newState,
        });
    }
    async registerToken(userId, token) {
        if (!expo_server_sdk_1.Expo.isExpoPushToken(token)) {
            throw new Error('Invalid Expo push token');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { pushToken: token },
        });
        this.logger.log(`Registered push token for user ${userId}`);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map