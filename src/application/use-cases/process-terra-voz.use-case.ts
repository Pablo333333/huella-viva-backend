import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AiService } from '../../infrastructure/ai/ai.service';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../domain/repositories/commitment.repository.interface';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import {
  ProcessTerraVozDto,
  TerraVozParsedData,
  TerraVozResult,
} from '../dtos/terra-voz.dto';

@Injectable()
export class ProcessTerraVozUseCase {
  constructor(
    private readonly aiService: AiService,
    @Inject(IActivityRepository)
    private readonly activityRepository: IActivityRepository,
    @Inject(ICommitmentRepository)
    private readonly commitmentRepository: ICommitmentRepository,
    @Inject(ICommunityRepository)
    private readonly communityRepository: ICommunityRepository,
  ) {}

  async execute(
    dto: ProcessTerraVozDto,
    audioBuffer?: Buffer,
  ): Promise<TerraVozResult> {
    let text = dto.text?.trim() || '';

    if (audioBuffer && audioBuffer.length > 0) {
      text = await this.aiService.transcribeAudio(audioBuffer);
    }

    if (!text) {
      throw new BadRequestException(
        'No se proporcionó texto ni audio válido.',
      );
    }

    if (!dto.userId) {
      throw new BadRequestException('userId es requerido.');
    }

    const parsedData: TerraVozParsedData =
      await this.aiService.parseActivity(text);

    const { community, location: communityLocation } =
      await this.resolveCommunity(dto.communityId, parsedData.comunidadNombre);

    const hasGps =
      typeof dto.latitude === 'number' &&
      typeof dto.longitude === 'number' &&
      Number.isFinite(dto.latitude) &&
      Number.isFinite(dto.longitude);

    const activity = await this.activityRepository.create({
      tipo: parsedData.tipo,
      descripcion: parsedData.descripcion,
      fecha: new Date(
        this.aiService.resolveActivityFecha(text, parsedData.fecha),
      ),
      audioUrl: dto.audioUrl,
      // GPS del dispositivo tiene prioridad sobre location fija de comunidad
      latitude: hasGps ? dto.latitude : null,
      longitude: hasGps ? dto.longitude : null,
      location: hasGps ? dto.latitude! : communityLocation,
      userId: dto.userId,
      communityId: community.id,
    });

    let commitmentsCreated = 0;
    if (parsedData.commitments?.length) {
      for (const commitmentData of parsedData.commitments) {
        await this.commitmentRepository.create({
          descripcion: commitmentData.descripcion,
          responsable: commitmentData.responsable || 'Equipo territorial',
          fecha_cumplimiento: commitmentData.fecha_cumplimiento
            ? new Date(commitmentData.fecha_cumplimiento)
            : null,
          activityId: activity.id,
        });
        commitmentsCreated += 1;
      }
    }

    const fullActivity = await this.activityRepository.findById(activity.id);

    return {
      activity: fullActivity || activity,
      commitmentsCreated,
      communityName: community.nombre,
      transcript: text,
      message: this.buildSuccessMessage(
        parsedData.tipo,
        commitmentsCreated,
        community.nombre,
      ),
    };
  }

  private async resolveCommunity(
    communityId?: string,
    comunidadNombre?: string | null,
  ) {
    let communities = await this.communityRepository.findAll();

    // Tras un reset total: crear comunidad territorial al vuelo para Terra Voz
    if (!communities.length) {
      const created = await this.communityRepository.create({
        nombre: comunidadNombre?.trim() || 'Territorio en vivo',
        poblacion: 0,
        location: null,
      });
      return { community: created, location: created.location ?? null };
    }

    if (communityId) {
      const byId = communities.find((c) => c.id === communityId);
      if (byId) {
        return { community: byId, location: byId.location ?? null };
      }
    }

    if (comunidadNombre) {
      const needle = this.normalize(comunidadNombre);
      const byName = communities.find((c) => {
        const name = this.normalize(c.nombre);
        return name.includes(needle) || needle.includes(name);
      });
      if (byName) {
        return { community: byName, location: byName.location ?? null };
      }
    }

    const fallback = communities[0];
    return { community: fallback, location: fallback.location ?? null };
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/comunidad\s+/g, '')
      .trim();
  }

  private buildSuccessMessage(
    tipo: string,
    commitmentsCreated: number,
    communityName: string,
  ): string {
    const base = `${tipo} registrada en ${communityName}`;
    if (commitmentsCreated > 0) {
      return `${base} con ${commitmentsCreated} compromiso(s).`;
    }
    return `${base}.`;
  }
}
