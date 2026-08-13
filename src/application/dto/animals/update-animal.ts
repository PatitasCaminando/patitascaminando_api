import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import type {
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from '../../../domain/models/animals/animal';

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  species?: AnimalSpecies;

  @IsOptional()
  @IsString()
  sex?: AnimalSex;

  @IsOptional()
  @IsString()
  size?: AnimalSize;

  @IsOptional()
  @IsString()
  approximateAge?: string;

  @IsOptional()
  @IsIn(['disponible', 'en_proceso', 'adoptado', 'no_disponible', 'archivado'])
  status?: AnimalStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  generalCondition?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoPaths?: string[];

  @IsOptional()
  @IsBoolean()
  isSterilized?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isVaccinated?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isDewormed?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPubliclyVisible?: boolean;
}
