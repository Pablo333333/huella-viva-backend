import { Controller, Get, Param } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';

@Controller('communities')
export class CommunitiesController {
  constructor(
    @Inject(ICommunityRepository)
    private readonly communityRepository: ICommunityRepository,
  ) {}

  @Get()
  async findAll() {
    return this.communityRepository.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.communityRepository.findById(id);
  }
}
