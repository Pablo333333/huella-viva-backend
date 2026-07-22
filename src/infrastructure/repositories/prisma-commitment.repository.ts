import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICommitmentRepository } from '../../domain/repositories/commitment.repository.interface';
import { Commitment } from '../../domain/entities/commitment.entity';

@Injectable()
export class PrismaCommitmentRepository implements ICommitmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(commitment: Partial<Commitment>): Promise<Commitment> {
    const created = await this.prisma.commitment.create({
      data: {
        descripcion: commitment.descripcion!,
        responsable: commitment.responsable!,
        fecha_cumplimiento: commitment.fecha_cumplimiento,
        estado: (commitment.estado as any) || 'PROGRAMADO',
        activityId: commitment.activityId!,
      },
    });
    return new Commitment(created as any);
  }

  async findByActivityId(activityId: string): Promise<Commitment[]> {
    const commitments = await this.prisma.commitment.findMany({
      where: { activityId },
    });
    return commitments.map(c => new Commitment(c as any));
  }

  async update(id: string, commitment: Partial<Commitment>): Promise<Commitment> {
    const updated = await this.prisma.commitment.update({
      where: { id },
      data: {
        descripcion: commitment.descripcion,
        responsable: commitment.responsable,
        fecha_cumplimiento: commitment.fecha_cumplimiento,
        estado: commitment.estado as any,
      },
    });
    return new Commitment(updated as any);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.commitment.delete({
      where: { id },
    });
  }
}
