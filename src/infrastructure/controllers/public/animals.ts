import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginationQueryDto } from '../../../application/dto/common/pagination-query';
import { GetPublicAnimalBySlugUseCase } from '../../../application/use-cases/animals/get-public-animal-by-slug';
import { GetPublicAnimalsUseCase } from '../../../application/use-cases/animals/get-public-animals';
import type { Animal } from '../../../domain/models/animals/animal';
import type { PaginatedResult } from '../../../domain/models/common/pagination';

@Controller('public/animals')
export class PublicAnimalsController {
  constructor(
    private readonly getPublicAnimalsUseCase: GetPublicAnimalsUseCase,
    private readonly getPublicAnimalBySlugUseCase: GetPublicAnimalBySlugUseCase,
  ) {}

  @Get()
  getAnimals(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<Animal>> {
    return this.getPublicAnimalsUseCase.execute(query);
  }

  @Get(':slug')
  getAnimalBySlug(@Param('slug') slug: string): Promise<Animal> {
    return this.getPublicAnimalBySlugUseCase.execute(slug);
  }
}
