import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('categories')
  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Get('workflow-states')
  async getWorkflowStates() {
    return this.prisma.workflowState.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
