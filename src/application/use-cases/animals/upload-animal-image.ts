import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AnimalImage } from '../../../domain/models/animals/animal';
import {
  ANIMAL_REPOSITORY,
  type AnimalRepositoryPort,
  type UploadedAnimalImage,
  type UploadAnimalImageInput,
} from '../../../domain/ports/output/animal-repository';

@Injectable()
export class UploadAnimalImageUseCase {
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

  constructor(
    @Inject(ANIMAL_REPOSITORY)
    private readonly animalRepository: AnimalRepositoryPort,
    private readonly config: ConfigService,
  ) {}

  execute(
    animalId: string,
    input: UploadAnimalImageInput,
  ): Promise<AnimalImage> {
    this.validateImage(input);
    return this.animalRepository.uploadImage(animalId, input);
  }

  executeWithoutAnimal(
    input: UploadAnimalImageInput,
  ): Promise<UploadedAnimalImage> {
    this.validateImage(input);
    return this.animalRepository.uploadImageFile(input);
  }

  private validateImage(input: UploadAnimalImageInput): void {
    if (!this.allowedMimeTypes.has(input.mimeType)) {
      throw new BadRequestException(
        'Formato de imagen no permitido. Use JPG, PNG o WEBP.',
      );
    }

    const maxSizeMb =
      Number(this.config.get<string>('MAX_ANIMAL_IMAGE_SIZE_MB')) || 5;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (input.size > maxSizeBytes) {
      throw new BadRequestException(
        `La imagen supera el tamano maximo permitido de ${maxSizeMb} MB.`,
      );
    }
  }
}
