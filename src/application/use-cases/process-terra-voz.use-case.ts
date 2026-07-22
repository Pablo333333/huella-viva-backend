import { Inject, Injectable } from '@nestjs/common';
import { AiService } from '../../infrastructure/ai/ai.service';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../domain/repositories/commitment.repository.interface';
import { ProcessTerraVozDto, TerraVozParsedData } from '../dtos/terra-voz.dto';
import { Activity } from '../../domain/entities/activity.entity';

@Injectable()
export class ProcessTerraVozUseCase {
  constructor(
    private readonly aiService: AiService,
    @Inject(IActivityRepository)
    private readonly activityRepository: IActivityRepository,
    @Inject(ICommitmentRepository)
    private readonly commitmentRepository: ICommitmentRepository,
  ) {}

  async execute(dto: ProcessTerraVozDto, audioBuffer?: Buffer): Promise<Activity> {
    let text = dto.text || '';

    // 1. Si hay audio, transcribir
    if (audioBuffer) {
      text = await this.aiService.transcribeAudio(audioBuffer);
    }

    if (!text) {
      throw new Error('No se proporcionó texto ni audio válido.');
    }

    // 2. Parsear el texto usando GPT-4o
    const parsedData: TerraVozParsedData = await this.aiService.parseActivity(text);

    // 3. Crear la Actividad (Memoria Viva)
    const activity = await this.activityRepository.create({
      tipo: parsedData.tipo,
      descripcion: parsedData.descripcion,
      fecha: parsedData.fecha ? new Date(parsedData.fecha) : new Date(),
      audioUrl: dto.audioUrl,
      userId: dto.userId,
      communityId: dto.communityId,
    });

    // 4. Crear los Compromisos asociados
    if (parsedData.commitments && parsedData.commitments.length > 0) {
      for (const commitmentData of parsedData.commitments) {
        await this.commitmentRepository.create({
          descripcion: commitmentData.descripcion,
          responsable: commitmentData.responsable,
          fecha_cumplimiento: commitmentData.fecha_cumplimiento ? new Date(commitmentData.fecha_cumplimiento) : null,
          activityId: activity.id,
        });
      }
    }

    return activity;
  }
}
