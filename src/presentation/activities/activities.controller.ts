import { Controller, Post, Body, UseInterceptors, UploadedFile, Get, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcessTerraVozUseCase } from '../../application/use-cases/process-terra-voz.use-case';
import { ProcessTerraVozDto } from '../../application/dtos/terra-voz.dto';
import { IActivityRepository } from '../../domain/repositories/activity.repository.interface';
import { Inject } from '@nestjs/common';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly processTerraVozUseCase: ProcessTerraVozUseCase,
    @Inject(IActivityRepository)
    private readonly activityRepository: IActivityRepository,
  ) {}

  @Post('terra-voz')
  @UseInterceptors(FileInterceptor('audio'))
  async processTerraVoz(
    @Body() dto: ProcessTerraVozDto,
    @UploadedFile() audioFile?: Express.Multer.File,
  ) {
    return this.processTerraVozUseCase.execute(dto, audioFile?.buffer);
  }

  @Get()
  async findAll(@Query('communityId') communityId?: string, @Query('type') type?: string) {
    return this.activityRepository.findAll({ communityId, type });
  }

  @Get('community/:id')
  async getCommunityActivities(@Param('id') id: string) {
    return this.activityRepository.findAll({ communityId: id });
  }

  @Get('timeline/:communityId')
  async getTimeline(@Param('communityId') communityId: string) {
    return this.activityRepository.getTimeline(communityId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.activityRepository.findById(id);
  }
}
