import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AiService } from '../../infrastructure/ai/ai.service';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../domain/repositories/commitment.repository.interface';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import { Community } from '../../domain/entities/community.entity';
import {
  ConfirmTerraVozDto,
  ProcessTerraVozDto,
  TerraVozParsedData,
  TerraVozPreviewResult,
  TerraVozResult,
  TerraVozValidation,
} from '../dtos/terra-voz.dto';

type CommunitySource = 'name' | 'gps' | 'user' | 'none';

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

  async preview(
    dto: ProcessTerraVozDto,
    audioBuffer?: Buffer,
  ): Promise<TerraVozPreviewResult> {
    const transcript = await this.resolveTranscript(dto, audioBuffer);
    const parsedData = this.aiService.parseActivityFast(transcript);
    const communities = await this.communityRepository.findAll();

    const { community, source } = await this.resolveCommunity({
      communityId: dto.communityId,
      comunidadNombre: parsedData.comunidadNombre,
      transcript,
      latitude: dto.latitude,
      longitude: dto.longitude,
      communities,
    });

    const validation = this.validateMessage(transcript, parsedData, community);

    return {
      transcript,
      parsed: parsedData,
      suggestedCommunity: community
        ? { id: community.id, nombre: community.nombre }
        : null,
      communitySource: source,
      communities: communities.map((c) => ({ id: c.id, nombre: c.nombre })),
      validation,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
    };
  }

  async confirm(dto: ConfirmTerraVozDto): Promise<TerraVozResult> {
    if (!dto.userId) {
      throw new BadRequestException('userId es requerido.');
    }

    const transcript = dto.transcript?.trim();
    if (!transcript) {
      throw new BadRequestException('El mensaje no puede estar vacío.');
    }

    const community = await this.communityRepository.findById(dto.communityId);
    if (!community) {
      throw new BadRequestException('Selecciona una comunidad válida.');
    }

    const parsedLike: TerraVozParsedData = {
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      fecha: dto.fecha,
      estado: dto.estado,
      comunidadNombre: community.nombre,
      commitments: (dto.commitments || []).map((c) => ({
        descripcion: c.descripcion,
        responsable: c.responsable || 'Equipo territorial',
        fecha_cumplimiento: c.fecha_cumplimiento,
      })),
    };

    const validation = this.validateMessage(transcript, parsedLike, community);
    if (!validation.complete) {
      throw new BadRequestException(validation.issues.join(' '));
    }

    const hasGps =
      typeof dto.latitude === 'number' &&
      typeof dto.longitude === 'number' &&
      Number.isFinite(dto.latitude) &&
      Number.isFinite(dto.longitude);

    const activity = await this.activityRepository.create({
      tipo: dto.tipo,
      descripcion: dto.descripcion.trim(),
      fecha: new Date(this.aiService.resolveActivityFecha(transcript, dto.fecha)),
      estado: dto.estado,
      latitude: hasGps ? dto.latitude : null,
      longitude: hasGps ? dto.longitude : null,
      location: hasGps ? dto.latitude! : (community.latitude ?? community.location ?? null),
      userId: dto.userId,
      communityId: community.id,
    });

    let commitmentsCreated = 0;
    for (const commitmentData of parsedLike.commitments) {
      if (!commitmentData.descripcion?.trim()) continue;
      await this.commitmentRepository.create({
        descripcion: commitmentData.descripcion.trim(),
        responsable: commitmentData.responsable || 'Equipo territorial',
        fecha_cumplimiento: commitmentData.fecha_cumplimiento
          ? new Date(commitmentData.fecha_cumplimiento)
          : null,
        activityId: activity.id,
      });
      commitmentsCreated += 1;
    }

    const fullActivity = await this.activityRepository.findById(activity.id);

    return {
      activity: fullActivity || activity,
      commitmentsCreated,
      communityName: community.nombre,
      transcript,
      message: this.buildSuccessMessage(
        dto.tipo,
        dto.estado,
        commitmentsCreated,
        community.nombre,
      ),
    };
  }

  private async resolveTranscript(
    dto: ProcessTerraVozDto,
    audioBuffer?: Buffer,
  ): Promise<string> {
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

    return text.trim();
  }

  private validateMessage(
    transcript: string,
    parsed: TerraVozParsedData,
    community: Community | null,
  ): TerraVozValidation {
    const issues: string[] = [];
    const words = transcript
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);

    if (words.length < 5) {
      issues.push('El mensaje es demasiado corto o incompleto.');
    }

    if (!parsed.descripcion || parsed.descripcion.trim().length < 12) {
      issues.push('Falta una descripción clara de la actividad.');
    }

    if (!parsed.tipo) {
      issues.push('No se pudo identificar el tipo de actividad.');
    }

    if (!community) {
      issues.push('Selecciona la comunidad antes de enviar.');
    }

    if (
      /^(eh+|ah+|um+|hola|test|prueba|ok|sí|si)\s*$/i.test(transcript.trim())
    ) {
      issues.push('El mensaje no parece una actividad territorial válida.');
    }

    return {
      complete: issues.length === 0,
      issues,
    };
  }

  private async resolveCommunity(params: {
    communityId?: string;
    comunidadNombre?: string | null;
    transcript: string;
    latitude?: number;
    longitude?: number;
    communities: Community[];
  }): Promise<{ community: Community | null; source: CommunitySource }> {
    const { communities, transcript, comunidadNombre, communityId, latitude, longitude } =
      params;

    if (!communities.length) {
      return { community: null, source: 'none' };
    }

    const byTranscriptName = this.matchCommunityInText(communities, transcript);
    if (byTranscriptName) {
      return { community: byTranscriptName, source: 'name' };
    }

    if (comunidadNombre) {
      const byParsedName = this.matchCommunityByName(communities, comunidadNombre);
      if (byParsedName) {
        return { community: byParsedName, source: 'name' };
      }
    }

    const hasGps =
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude);

    if (hasGps) {
      const nearest = await this.communityRepository.findNearest(
        latitude!,
        longitude!,
      );
      if (nearest) {
        return { community: nearest, source: 'gps' };
      }
    }

    if (communityId) {
      const byUser = communities.find((c) => c.id === communityId) || null;
      if (byUser) {
        return { community: byUser, source: 'user' };
      }
    }

    return { community: null, source: 'none' };
  }

  private matchCommunityInText(
    communities: Community[],
    transcript: string,
  ): Community | null {
    const haystack = this.normalize(transcript);
    let best: { community: Community; score: number } | null = null;

    for (const community of communities) {
      const name = this.normalize(community.nombre);
      if (!name || name.length < 3) continue;
      if (haystack.includes(name) || name.split(' ').every((part) => haystack.includes(part))) {
        const score = name.length;
        if (!best || score > best.score) {
          best = { community, score };
        }
      }
    }

    return best?.community ?? null;
  }

  private matchCommunityByName(
    communities: Community[],
    comunidadNombre: string,
  ): Community | null {
    const needle = this.normalize(comunidadNombre);
    if (!needle || needle.length < 3) return null;

    const exact = communities.find((c) => this.normalize(c.nombre) === needle);
    if (exact) return exact;

    return (
      communities.find((c) => {
        const name = this.normalize(c.nombre);
        return name.includes(needle) || needle.includes(name);
      }) || null
    );
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/comunidad\s+/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildSuccessMessage(
    tipo: string,
    estado: string,
    commitmentsCreated: number,
    communityName: string,
  ): string {
    const estadoLabel = estado === 'PROGRAMADA' ? 'programada' : 'ejecutada';
    const base = `${tipo} ${estadoLabel} en ${communityName}`;
    if (commitmentsCreated > 0) {
      return `${base} con ${commitmentsCreated} compromiso(s).`;
    }
    return `${base}.`;
  }
}
