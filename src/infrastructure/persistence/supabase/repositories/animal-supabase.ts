import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import type {
  Animal,
  AnimalImage,
} from '../../../../domain/models/animals/animal';
import type {
  AddAnimalImageInput,
  AnimalRepositoryPort,
  CreateAnimalInput,
  UploadedAnimalImage,
  UpdateAnimalInput,
  UploadAnimalImageInput,
} from '../../../../domain/ports/output/animal-repository';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../../../domain/models/common/pagination';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { AnimalProfileRow } from '../types/bdd-supabase';

@Injectable()
export class AnimalSupabaseRepository implements AnimalRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {}

  async findPublicAnimals(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<Animal>> {
    const page = this.resolvePage(pagination);
    const { from, to } = this.rangeFor(page);

    const { data, error, count } = await this.supabase
      .from('animals')
      .select(this.animalSelect, { count: 'exact' })
      .eq('is_active', true)
      .eq('is_publicly_visible', true)
      .neq('status', 'archivado')
      .order('created_at', { ascending: false })
      .range(from, to)
      .returns<AnimalProfileRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toPaginatedResult(
      (data ?? []).map((row) => this.toAnimal(row)),
      page,
      count ?? 0,
    );
  }

  async findAdminAnimals(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<Animal>> {
    const page = this.resolvePage(pagination);
    const { from, to } = this.rangeFor(page);

    const { data, error, count } = await this.supabase
      .from('animals')
      .select(this.animalSelect, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)
      .returns<AnimalProfileRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toPaginatedResult(
      (data ?? []).map((row) => this.toAnimal(row)),
      page,
      count ?? 0,
    );
  }

  async findPublicAnimalBySlug(id: string): Promise<Animal> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(this.animalSelect)
      .eq('id', id)
      .eq('is_active', true)
      .eq('is_publicly_visible', true)
      .neq('status', 'archivado')
      .single<AnimalProfileRow>();

    if (error) throw new NotFoundException('Animal not found');
    return this.toAnimal(data);
  }

  async existsSimilarAnimal(input: CreateAnimalInput): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('animals')
      .select('id')
      .ilike('name', input.name.trim())
      .eq('species', input.species)
      .eq('sex', input.sex)
      .eq('approximate_age', input.approximateAge)
      .eq('size', input.size)
      .neq('status', 'archivado')
      .limit(1)
      .maybeSingle<{ id: string }>();

    if (error) throw new InternalServerErrorException(error.message);
    return Boolean(data);
  }

  async createAnimal(input: CreateAnimalInput): Promise<Animal> {
    const { data, error } = await this.supabase
      .from('animals')
      .insert({
        name: input.name,
        species: input.species,
        sex: input.sex,
        approximate_age: input.approximateAge,
        size: input.size,
        description: input.description,
        general_condition: input.generalCondition,
        photo_paths: input.photoPaths,
        is_sterilized: input.isSterilized,
        is_vaccinated: input.isVaccinated,
        is_dewormed: input.isDewormed,
        status: input.status,
        is_active: input.isActive,
        is_publicly_visible: input.isPubliclyVisible,
      })
      .select(this.animalSelect)
      .single<AnimalProfileRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toAnimal(data);
  }

  async updateAnimal(id: string, input: UpdateAnimalInput): Promise<Animal> {
    const { data, error } = await this.supabase
      .from('animals')
      .update({
        name: input.name,
        species: input.species,
        sex: input.sex,
        approximate_age: input.approximateAge,
        size: input.size,
        description: input.description,
        general_condition: input.generalCondition,
        photo_paths: input.photoPaths,
        is_sterilized: input.isSterilized,
        is_vaccinated: input.isVaccinated,
        is_dewormed: input.isDewormed,
        status: input.status,
        is_active: input.isActive,
        is_publicly_visible: input.isPubliclyVisible,
      })
      .eq('id', id)
      .select(this.animalSelect)
      .single<AnimalProfileRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toAnimal(data);
  }

  async deleteAnimal(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('animals')
      .update({
        status: 'archivado',
        is_active: false,
        is_publicly_visible: false,
      })
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
  }

  async addImage(
    animalId: string,
    input: AddAnimalImageInput,
  ): Promise<AnimalImage> {
    const animal = await this.findAdminAnimalById(animalId);
    const photoPaths = [...animal.photoPaths, input.mediaId];
    await this.updateAnimal(animalId, { photoPaths });
    return this.toImage(animalId, input.mediaId, photoPaths.length - 1);
  }

  async uploadImage(
    animalId: string,
    input: UploadAnimalImageInput,
  ): Promise<AnimalImage> {
    await this.findAdminAnimalById(animalId);

    const uploadedImage = await this.uploadImageFile(input, animalId);

    return this.addImage(animalId, {
      mediaId: uploadedImage.mediaId,
    });
  }

  async uploadImageFile(
    input: UploadAnimalImageInput,
    folder = 'pending',
  ): Promise<UploadedAnimalImage> {
    const bucket =
      this.config.get<string>('SUPABASE_ANIMAL_IMAGES_BUCKET') ?? 'animals';
    const extension = this.extensionForMimeType(input.mimeType);
    const objectPath = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(objectPath, input.buffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (error) throw new InternalServerErrorException(error.message);

    return {
      mediaId: `${bucket}/${objectPath}`,
      bucket,
      path: objectPath,
    };
  }

  async deleteImage(animalId: string, imageId: string): Promise<void> {
    const animal = await this.findAdminAnimalById(animalId);
    await this.updateAnimal(animalId, {
      photoPaths: animal.photoPaths.filter((path) => path !== imageId),
    });
  }

  private async findAdminAnimalById(id: string): Promise<Animal> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(this.animalSelect)
      .eq('id', id)
      .single<AnimalProfileRow>();

    if (error) throw new NotFoundException('Animal not found');
    return this.toAnimal(data);
  }

  private toAnimal(row: AnimalProfileRow): Animal {
    return {
      id: row.id,
      name: row.name,
      species: row.species,
      sex: row.sex,
      approximateAge: row.approximate_age,
      size: row.size,
      description: row.description,
      generalCondition: row.general_condition,
      photoPaths: row.photo_paths,
      isSterilized: row.is_sterilized,
      isVaccinated: row.is_vaccinated,
      isDewormed: row.is_dewormed,
      status: row.status,
      isActive: row.is_active,
      isPubliclyVisible: row.is_publicly_visible,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      images: row.photo_paths.map((path, index) =>
        this.toImage(row.id, path, index),
      ),
    };
  }

  private toImage(
    animalId: string,
    path: string,
    orderIndex: number,
  ): AnimalImage {
    const now = new Date().toISOString();
    return {
      id: path,
      animalId,
      mediaId: path,
      isPrimary: orderIndex === 0,
      orderIndex,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  }

  private resolvePage(pagination?: PaginationInput): Required<PaginationInput> {
    return {
      page: Math.max(1, Number(pagination?.page) || 1),
      limit: Math.min(100, Math.max(1, Number(pagination?.limit) || 10)),
    };
  }

  private rangeFor(pagination: Required<PaginationInput>): {
    from: number;
    to: number;
  } {
    const from = (pagination.page - 1) * pagination.limit;
    return {
      from,
      to: from + pagination.limit - 1,
    };
  }

  private toPaginatedResult<T>(
    items: T[],
    pagination: Required<PaginationInput>,
    total: number,
  ): PaginatedResult<T> {
    return {
      items,
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  private extensionForMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return extensions[mimeType] ?? 'bin';
  }

  private readonly animalSelect =
    'id, name, species, sex, approximate_age, size, description, general_condition, photo_paths, is_sterilized, is_vaccinated, is_dewormed, status, is_active, is_publicly_visible, created_at, updated_at';
}
