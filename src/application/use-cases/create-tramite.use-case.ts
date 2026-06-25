import { Inject, Injectable } from '@nestjs/common';
import { ITramiteRepository } from '../../domain/repositories/tramite.repository.interface';
import { CreateTramiteDto } from '../dtos/tramite.dto';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AuditService } from '../../infrastructure/audit/audit.service';

@Injectable()
export class CreateTramiteUseCase {
  constructor(
    @Inject(ITramiteRepository)
    private readonly tramiteRepository: ITramiteRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(remitenteId: string, dto: CreateTramiteDto): Promise<Tramite> {
    const tramite = await this.tramiteRepository.create({
      ...dto,
      remitenteId,
      fechaLimite: dto.fechaLimite ? new Date(dto.fechaLimite) : undefined,
    });

    // Auditoría con Blockchain
    await this.auditService.logAction(tramite.id, 'TRAMITE', { ...dto, remitenteId });

    return tramite;
  }
}
