import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { SiteSectionKey } from '../../../domain/models/site-sections/site-section';

export class CreateSiteSectionDto {
  @IsIn(['rescatistas', 'bienestar_animal', 'contacto', 'redes_sociales'])
  sectionKey: SiteSectionKey;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
