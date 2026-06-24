import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true },
      });

      if (!user || !user.pushToken) {
        this.logger.warn(`User ${userId} not found or has no push token`);
        return;
      }

      if (!Expo.isExpoPushToken(user.pushToken)) {
        this.logger.error(`Push token ${user.pushToken} is not a valid Expo push token`);
        return;
      }

      const messages: ExpoPushMessage[] = [{
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      }];

      // Expo permite enviar mensajes en lotes (chunks)
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          this.logger.log(`Sent push notification chunk to user ${userId}`);
        } catch (error) {
          this.logger.error(`Error sending push notification chunk: ${error.message}`);
        }
      }

      // NOTA: En una implementación de producción, deberíamos manejar los "tickets" 
      // para detectar tokens inválidos o expirados y eliminarlos de la DB.
    } catch (error) {
      this.logger.error(`Error in sendPushNotification for user ${userId}: ${error.message}`);
    }
  }

  async notifyStateChange(userId: string, entityType: string, entityId: string, newState: string) {
    const title = `Actualización de ${entityType}`;
    const body = `El ${entityType.toLowerCase()} con ID ${entityId.substring(0, 8)} ha cambiado a estado: ${newState}`;
    
    await this.sendPushNotification(userId, title, body, {
      entityId,
      entityType,
      newState,
    });
  }

  async registerToken(userId: string, token: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo push token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: token },
    });

    this.logger.log(`Registered push token for user ${userId}`);
  }
}
