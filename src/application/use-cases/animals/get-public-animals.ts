import { Inject, Injectable } from '@nestjs/common';
import type { Animal } from '../../../domain/models/animals/animal';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../../domain/models/common/pagination';
import {
  ANIMAL_REPOSITORY,
  type AnimalRepositoryPort,
} from '../../../domain/ports/output/animal-repository';

@Injectable()
export class GetPublicAnimalsUseCase {
  constructor(
    @Inject(ANIMAL_REPOSITORY)
    private readonly animalRepository: AnimalRepositoryPort,
  ) {}

  execute(pagination?: PaginationInput): Promise<PaginatedResult<Animal>> {
    return this.animalRepository.findPublicAnimals(pagination);
  }
}
