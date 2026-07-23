import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { ICommunityRepository } from '../../domain/repositories/community.repository.interface';
import { PrismaCommunityRepository } from '../../infrastructure/repositories/prisma-community.repository';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommunitiesController],
  providers: [
    {
      provide: ICommunityRepository,
      useClass: PrismaCommunityRepository,
    },
  ],
  exports: [ICommunityRepository],
})
export class CommunitiesModule {}
