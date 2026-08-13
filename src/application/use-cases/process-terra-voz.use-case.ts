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
  TerraVozLocationSource,
  TerraVozParsedData,
  TerraVozPreviewResult,
  TerraVozResult,
  TerraVozValidation,
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

  async preview(
    dto: ProcessTerraVozDto,
    audioBuffer?: Buffer,
  ): Promise<TerraVozPreviewResult> {
    const transcript = await this.resolveTranscript(dto, audioBuffer);
    const parsedData = this.aiService.parseActivityFast(transcript);
    const { ubicacionTexto, source } = this.resolveUbicacionTexto({
      parsedName: parsedData.comunidadNombre,
      transcript,
      gpsPlaceName: dto.gpsPlaceName,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    parsedData.comunidadNombre = ubicacionTexto || parsedData.comunidadNombre || null;
    const validation = this.validateMessage(transcript, parsedData, ubicacionTexto);

    return {
      transcript,
      parsed: parsedData,
      ubicacionTexto,
      communitySource: source,
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

    const comunidadNombre = dto.comunidadNombre?.trim();
    if (!comunidadNombre) {
      throw new BadRequestException('Indica la comunidad o ubicación.');
    }

    const parsedLike: TerraVozParsedData = {
      tipo: dto.tipo,
      descripcion: dto.descripcion,
      fecha: dto.fecha,
      estado: dto.estado,
      comunidadNombre,
      commitments: (dto.commitments || []).map((c) => ({
        descripcion: c.descripcion,
        responsable: c.responsable || 'Equipo territorial',
        fecha_cumplimiento: c.fecha_cumplimiento,
      })),
    };

    const validation = this.validateMessage(transcript, parsedLike, comunidadNombre);
    if (!validation.complete) {
      throw new BadRequestException(validation.issues.join(' '));
    }

    const hasGps =
      typeof dto.latitude === 'number' &&
      typeof dto.longitude === 'number' &&
      Number.isFinite(dto.latitude) &&
      Number.isFinite(dto.longitude);

    const community = await this.resolveOrCreateCommunity(
      comunidadNombre,
      hasGps ? dto.latitude : null,
      hasGps ? dto.longitude : null,
    );

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

  private resolveUbicacionTexto(params: {
    parsedName?: string | null;
    transcript: string;
    gpsPlaceName?: string;
    latitude?: number;
    longitude?: number;
  }): { ubicacionTexto: string; source: TerraVozLocationSource } {
    const fromAudio = params.parsedName?.trim();
    if (fromAudio) {
      return { ubicacionTexto: fromAudio, source: 'name' };
    }

    const fromGps = params.gpsPlaceName?.trim();
    if (fromGps) {
      return { ubicacionTexto: fromGps, source: 'gps' };
    }

    const hasGps =
      typeof params.latitude === 'number' &&
      typeof params.longitude === 'number' &&
      Number.isFinite(params.latitude) &&
      Number.isFinite(params.longitude);
    if (hasGps) {
      return {
        ubicacionTexto: `${params.latitude!.toFixed(5)}, ${params.longitude!.toFixed(5)}`,
        source: 'gps',
      };
    }

    const fromTranscript = params.transcript.trim();
    if (fromTranscript) {
      return { ubicacionTexto: fromTranscript, source: 'transcript' };
    }

    return { ubicacionTexto: '', source: 'none' };
  }

  private async resolveOrCreateCommunity(
    nombre: string,
    latitude?: number | null,
    longitude?: number | null,
  ): Promise<Community> {
    const existing = await this.communityRepository.findByNombre(nombre);
    if (existing) {
      if (
        (existing.latitude == null || existing.longitude == null) &&
        typeof latitude === 'number' &&
        typeof longitude === 'number'
      ) {
        return this.communityRepository.update(existing.id, {
          latitude,
          longitude,
          location: latitude,
        });
      }
      return existing;
    }

    return this.communityRepository.create({
      nombre,
      poblacion: 0,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      location: latitude ?? null,
    });
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
    ubicacionTexto?: string | null,
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

    if (!ubicacionTexto || ubicacionTexto.trim().length < 2) {
      issues.push('Indica la comunidad o ubicación antes de enviar.');
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
