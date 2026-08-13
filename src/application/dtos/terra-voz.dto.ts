import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function toOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export class ProcessTerraVozDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  @IsOptional()
  communityId?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  /** Latitud GPS del dispositivo (multipart llega como string). */
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  latitude?: number;

  /** Longitud GPS del dispositivo. */
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  longitude?: number;
}

export class TerraVozCommitmentDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  responsable?: string;

  @IsOptional()
  @IsString()
  fecha_cumplimiento?: string;
}

export class ConfirmTerraVozDto {
  @IsString()
  @IsNotEmpty()
  transcript: string;

  @IsString()
  @IsIn(['REUNION', 'INSPECCION', 'VISITA', 'TALLER', 'OTRO'])
  tipo: TerraVozParsedData['tipo'];

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsIn(['PROGRAMADA', 'EJECUTADA'])
  estado: 'PROGRAMADA' | 'EJECUTADA';

  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerraVozCommitmentDto)
  commitments?: TerraVozCommitmentDto[];
}

export class UpdateActivityStatusDto {
  @IsString()
  @IsIn(['PROGRAMADA', 'EJECUTADA'])
  estado: 'PROGRAMADA' | 'EJECUTADA';
}

export class UpdateCommitmentStatusDto {
  @IsString()
  @IsIn(['PROGRAMADO', 'EN_PROCESO', 'CUMPLIDO'])
  estado: 'PROGRAMADO' | 'EN_PROCESO' | 'CUMPLIDO';
}

export interface TerraVozParsedData {
  tipo: 'REUNION' | 'INSPECCION' | 'VISITA' | 'TALLER' | 'OTRO';
  descripcion: string;
  fecha: string;
  estado: 'PROGRAMADA' | 'EJECUTADA';
  comunidadNombre?: string | null;
  commitments: {
    descripcion: string;
    responsable: string;
    fecha_cumplimiento?: string;
  }[];
}

export interface TerraVozValidation {
  complete: boolean;
  issues: string[];
}

export interface TerraVozCommunityOption {
  id: string;
  nombre: string;
}

export interface TerraVozPreviewResult {
  transcript: string;
  parsed: TerraVozParsedData;
  suggestedCommunity: TerraVozCommunityOption | null;
  communitySource: 'name' | 'gps' | 'user' | 'none';
  communities: TerraVozCommunityOption[];
  validation: TerraVozValidation;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TerraVozResult {
  activity: {
    id: string;
    tipo: string;
    descripcion: string;
    fecha: Date;
    estado?: string;
    audioUrl?: string | null;
    fotoUrl?: string | null;
    location?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    userId: string;
    communityId: string;
    communityName?: string;
    commitments?: unknown[];
    createdAt?: Date;
    updatedAt?: Date;
  };
  commitmentsCreated: number;
  communityName?: string;
  transcript: string;
  message: string;
}
