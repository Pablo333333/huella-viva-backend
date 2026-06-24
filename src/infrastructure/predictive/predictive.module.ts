import { Module } from '@nestjs/common';
import { PredictiveService } from './predictive.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [PredictiveService],
  exports: [PredictiveService],
})
export class PredictiveModule {}
