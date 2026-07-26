import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Animal,
  AnimalImage,
} from '../../../../domain/models/animals/animal';
import type {
  AddAnimalImageInput,
  AnimalRepositoryPort,
  CreateAnimalInput,
  UpdateAnimalInput,
} from '../../../../domain/ports/output/animal-repository';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { AnimalProfileRow } from '../types/bdd-supabase';

@Injectable()
export class AnimalSupabaseRepository implements AnimalRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findPublicAnimals(): Promise<Animal[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(this.animalSelect)
      .eq('is_active', true)
      .eq('is_publicly_visible', true)
      .neq('status', 'archivado')
      .order('created_at', { ascending: false })
      .returns<AnimalProfileRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toAnimal(row));
  }

  async findAdminAnimals(): Promise<Animal[]> {
    const { data, error } = await this.supabase
      .from('animals')
      .select(this.animalSelect)
      .order('created_at', { ascending: false })
      .returns<AnimalProfileRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toAnimal(row));
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

  private readonly animalSelect =
    'id, name, species, sex, approximate_age, size, description, general_condition, photo_paths, status, is_active, is_publicly_visible, created_at, updated_at';
}
