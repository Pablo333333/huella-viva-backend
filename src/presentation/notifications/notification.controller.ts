import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationService } from '../../infrastructure/notifications/notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register-token')
  async registerToken(@Request() req: any, @Body('token') token: string) {
    await this.notificationService.registerToken(req.user.userId, token);
    return { success: true, message: 'Push token registered successfully' };
  }
}
