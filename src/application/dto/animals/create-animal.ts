import {
  ArrayMinSize,
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

export class CreateAnimalDto {
  @IsString()
  name: string;

  @IsString()
  species: AnimalSpecies;

  @IsString()
  sex: AnimalSex;

  @IsString()
  size: AnimalSize;

  @IsString()
  approximateAge: string;

  @IsOptional()
  @IsIn(['disponible', 'en_proceso', 'adoptado', 'no_disponible', 'archivado'])
  status?: AnimalStatus;

  @IsString()
  description: string;

  @IsString()
  generalCondition: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  photoPaths: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPubliclyVisible?: boolean;
}
