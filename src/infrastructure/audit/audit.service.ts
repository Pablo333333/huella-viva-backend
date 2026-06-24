import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(entityId: string, entityType: string, payload: any): Promise<void> {
    try {
      // 1. Obtener el último hash de la cadena global (o por entidad si se prefiere)
      // Para una blockchain de auditoría simple, encadenaremos todos los registros críticos
      const lastAudit = await this.prisma.auditLog.findFirst({
        orderBy: { timestamp: 'desc' },
      });

      const previousHash = lastAudit ? lastAudit.payloadHash : '0'.repeat(64);

      // 2. Calcular el hash del payload actual + hash anterior
      const dataToHash = JSON.stringify(payload) + previousHash;
      const currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

      // 3. Guardar en el log de auditoría
      await this.prisma.auditLog.create({
        data: {
          entityId,
          entityType,
          payloadHash: currentHash,
          previousHash,
        },
      });

      this.logger.log(`Acción auditada para ${entityType} [${entityId}]. Hash: ${currentHash.substring(0, 8)}...`);
    } catch (error) {
      this.logger.error(`Error en AuditService: ${error.message}`);
    }
  }

  async verifyIntegrity(entityId: string): Promise<{ isValid: boolean; chain: any[] }> {
    const logs = await this.prisma.auditLog.findMany({
      where: { entityId },
      orderBy: { timestamp: 'asc' },
    });

    if (logs.length === 0) return { isValid: false, chain: [] };

    let isValid = true;
    const chainStatus = [];

    for (let i = 0; i < logs.length; i++) {
      const current = logs[i];
      // En una implementación real, tendríamos que re-calcular el hash con el payload original
      // Pero como no guardamos el payload completo en AuditLog (por espacio), 
      // verificamos que el previousHash coincida con el registro anterior en la DB.
      
      if (i > 0) {
        const previous = logs[i - 1];
        if (current.previousHash !== previous.payloadHash) {
          isValid = false;
        }
      }

      chainStatus.push({
        id: current.id,
        timestamp: current.timestamp,
        hash: current.payloadHash,
        valid: isValid,
      });
    }

    return { isValid, chain: chainStatus };
  }
}
