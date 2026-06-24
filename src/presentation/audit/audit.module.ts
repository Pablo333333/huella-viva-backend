import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditModule as AuditInfraModule } from '../../infrastructure/audit/audit.module';

@Module({
  imports: [AuditInfraModule],
  controllers: [AuditController],
})
export class AuditPresentationModule {}
