import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Animal } from '../../../domain/models/animals/animal';
import {
  ANIMAL_REPOSITORY,
  type AnimalRepositoryPort,
  type CreateAnimalInput,
} from '../../../domain/ports/output/animal-repository';

@Injectable()
export class CreateAnimalUseCase {
  constructor(
    @Inject(ANIMAL_REPOSITORY)
    private readonly animalRepository: AnimalRepositoryPort,
  ) {}

  async execute(input: CreateAnimalInput): Promise<Animal> {
    const alreadyExists =
      await this.animalRepository.existsSimilarAnimal(input);

    if (alreadyExists) {
      throw new ConflictException(
        'Ya existe un animal registrado con los mismos datos principales.',
      );
    }

    return this.animalRepository.createAnimal(input);
  }
}
