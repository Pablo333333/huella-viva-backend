import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Inject } from '@nestjs/common';
import { ProcessTerraVozUseCase } from '../../application/use-cases/process-terra-voz.use-case';
import {
  ConfirmTerraVozDto,
  ProcessTerraVozDto,
  UpdateActivityStatusDto,
  UpdateCommitmentStatusDto,
} from '../../application/dtos/terra-voz.dto';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { ICommitmentRepository } from '../../domain/repositories/commitment.repository.interface';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly processTerraVozUseCase: ProcessTerraVozUseCase,
    @Inject(IActivityRepository)
    private readonly activityRepository: IActivityRepository,
    @Inject(ICommitmentRepository)
    private readonly commitmentRepository: ICommitmentRepository,
  ) {}

  @Post('terra-voz/preview')
  @UseInterceptors(FileInterceptor('audio'))
  async previewTerraVoz(
    @Body() dto: ProcessTerraVozDto,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.processTerraVozUseCase.preview(dto, audioFile?.buffer);
  }

  @Post('terra-voz/confirm')
  async confirmTerraVoz(@Body() dto: ConfirmTerraVozDto) {
    return this.processTerraVozUseCase.confirm(dto);
  }

  /** Compatibilidad: preview + confirm automático (no recomendado). */
  @Post('terra-voz')
  @UseInterceptors(FileInterceptor('audio'))
  async processTerraVoz(
    @Body() dto: ProcessTerraVozDto,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    const preview = await this.processTerraVozUseCase.preview(
      dto,
      audioFile?.buffer,
    );
    if (!preview.validation.complete || !preview.suggestedCommunity) {
      return preview;
    }
    return this.processTerraVozUseCase.confirm({
      transcript: preview.transcript,
      tipo: preview.parsed.tipo,
      descripcion: preview.parsed.descripcion,
      fecha: preview.parsed.fecha,
      estado: preview.parsed.estado,
      communityId: preview.suggestedCommunity.id,
      userId: dto.userId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      commitments: preview.parsed.commitments,
    });
  }

  @Get()
  async findAll(
    @Query('communityId') communityId?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.activityRepository.findAll({ communityId, type, userId, estado });
  }

  @Get('community/:id')
  async getCommunityActivities(@Param('id') id: string) {
    return this.activityRepository.findAll({ communityId: id });
  }

  @Get('timeline/:communityId')
  async getTimeline(@Param('communityId') communityId: string) {
    return this.activityRepository.getTimeline(communityId);
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body() dto: UpdateActivityStatusDto,
  ) {
    return this.activityRepository.update(id, { estado: dto.estado });
  }

  @Patch(':id/commitments/:commitmentId/estado')
  async updateCommitmentEstado(
    @Param('commitmentId') commitmentId: string,
    @Body() dto: UpdateCommitmentStatusDto,
  ) {
    return this.commitmentRepository.update(commitmentId, { estado: dto.estado });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityRepository.findById(id);
  }
}
