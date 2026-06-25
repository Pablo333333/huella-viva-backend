import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString, IsNumber } from 'class-validator';
import { TramiteType } from '@prisma/client';

export class CreateTramiteDto {
  @IsEnum(TramiteType)
  @IsNotEmpty()
  tipo: TramiteType;

  @IsUUID()
  @IsNotEmpty()
  destinatarioId: string;

  @IsUUID()
  @IsNotEmpty()
  estadoId: string;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;
}

export class UpdateTramiteDto {
  @IsEnum(TramiteType)
  @IsOptional()
  tipo?: TramiteType;

  @IsUUID()
  @IsOptional()
  destinatarioId?: string;

  @IsUUID()
  @IsOptional()
  estadoId?: string;

  @IsDateString()
  @IsOptional()
  fechaLimite?: string;
}
