import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from '../../infrastructure/audit/audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../infrastructure/auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('verify/:id')
  @Roles(Role.ADMIN_TERRITORIAL)
  async verify(@Param('id') id: string) {
    return this.auditService.verifyIntegrity(id);
  }
}
