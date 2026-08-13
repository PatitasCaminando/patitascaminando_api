import type {
  Animal,
  AnimalImage,
  AnimalSex,
  AnimalSize,
  AnimalSpecies,
  AnimalStatus,
} from '../../models/animals/animal';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../models/common/pagination';

export const ANIMAL_REPOSITORY = Symbol('ANIMAL_REPOSITORY');

export interface CreateAnimalInput {
  createdBy?: string;
  name: string;
  species: AnimalSpecies;
  sex: AnimalSex;
  size: AnimalSize;
  approximateAge: string;
  status?: AnimalStatus;
  description: string;
  generalCondition: string;
  photoPaths: string[];
  isActive?: boolean;
  isPubliclyVisible?: boolean;
}

export interface UpdateAnimalInput {
  name?: string;
  species?: AnimalSpecies;
  sex?: AnimalSex;
  size?: AnimalSize;
  approximateAge?: string;
  status?: AnimalStatus;
  description?: string;
  generalCondition?: string;
  photoPaths?: string[];
  isActive?: boolean;
  isPubliclyVisible?: boolean;
}

export interface AddAnimalImageInput {
  mediaId: string;
  isPrimary?: boolean;
  orderIndex?: number;
}

export interface UploadAnimalImageInput {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedAnimalImage {
  mediaId: string;
  bucket: string;
  path: string;
}

export interface AnimalRepositoryPort {
  findPublicAnimals(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<Animal>>;
  findPublicAnimalBySlug(slug: string): Promise<Animal>;
  findAdminAnimals(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<Animal>>;
  existsSimilarAnimal(input: CreateAnimalInput): Promise<boolean>;
  createAnimal(input: CreateAnimalInput): Promise<Animal>;
  updateAnimal(id: string, input: UpdateAnimalInput): Promise<Animal>;
  deleteAnimal(id: string): Promise<void>;
  addImage(animalId: string, input: AddAnimalImageInput): Promise<AnimalImage>;
  uploadImageFile(input: UploadAnimalImageInput): Promise<UploadedAnimalImage>;
  uploadImage(
    animalId: string,
    input: UploadAnimalImageInput,
  ): Promise<AnimalImage>;
  deleteImage(animalId: string, imageId: string): Promise<void>;
}
