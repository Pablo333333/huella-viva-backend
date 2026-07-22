import { IsString, IsOptional } from 'class-validator';

export class ProcessTerraVozDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  communityId: string;

  @IsString()
  userId: string;
}

export interface TerraVozParsedData {
  tipo: 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';
  descripcion: string;
  fecha: string;
  commitments: {
    descripcion: string;
    responsable: string;
    fecha_cumplimiento?: string;
  }[];
}
