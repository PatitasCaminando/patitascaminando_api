import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type {
  AdoptionApplication,
  HousingType,
} from '../../../../domain/models/adoptions/adoption';
import type {
  AdoptionRepositoryPort,
  CreateAdoptionApplicationInput,
  CreateHousingTypeInput,
  UpdateAdoptionStatusInput,
  UpdateHousingTypeInput,
} from '../../../../domain/ports/output/adoption-repository';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../../../domain/models/common/pagination';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type {
  AdoptionApplicationRow,
  HousingTypeRow,
} from '../types/bdd-supabase';

@Injectable()
export class AdoptionSupabaseRepository implements AdoptionRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findPublicHousingTypes(): Promise<HousingType[]> {
    const { data, error } = await this.supabase
      .from('housing_types')
      .select(this.housingTypeSelect)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .returns<HousingTypeRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toHousingType(row));
  }

  async findAdminHousingTypes(): Promise<HousingType[]> {
    const { data, error } = await this.supabase
      .from('housing_types')
      .select(this.housingTypeSelect)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })
      .returns<HousingTypeRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toHousingType(row));
  }

  async createHousingType(input: CreateHousingTypeInput): Promise<HousingType> {
    const { data, error } = await this.supabase
      .from('housing_types')
      .insert({
        key: input.key,
        name: input.name,
        description: input.description,
        requires_other_detail: input.requiresOtherDetail,
        is_active: input.isActive,
        order_index: input.orderIndex,
      })
      .select(this.housingTypeSelect)
      .single<HousingTypeRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toHousingType(data);
  }

  async updateHousingType(
    id: string,
    input: UpdateHousingTypeInput,
  ): Promise<HousingType> {
    const { data, error } = await this.supabase
      .from('housing_types')
      .update({
        key: input.key,
        name: input.name,
        description: input.description,
        requires_other_detail: input.requiresOtherDetail,
        is_active: input.isActive,
        order_index: input.orderIndex,
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select(this.housingTypeSelect)
      .single<HousingTypeRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toHousingType(data);
  }

  deleteHousingType(id: string): Promise<void> {
    return this.softDelete('housing_types', id);
  }

  async createApplication(
    input: CreateAdoptionApplicationInput,
  ): Promise<AdoptionApplication> {
    const { data, error } = await this.supabase
      .from('adoption_applications')
      .insert({
        first_names: input.firstNames,
        last_names: input.lastNames,
        phone: input.phone,
        email: input.email,
        desired_animal_description: input.desiredAnimalDescription,
        adoption_reason: input.adoptionReason,
        specific_animal_id: input.specificAnimalId,
        additional_message: input.additionalMessage,
        data_processing_accepted: input.dataProcessingAccepted,
      })
      .select(this.applicationSelect)
      .single<AdoptionApplicationRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toApplication(data);
  }

  async findMyApplications(userId: string): Promise<AdoptionApplication[]> {
    const { data, error } = await this.supabase
      .from('adoption_applications')
      .select(this.applicationSelect)
      .eq('email', userId)
      .order('submitted_at', { ascending: false })
      .returns<AdoptionApplicationRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toApplication(row));
  }

  async findAdminApplications(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<AdoptionApplication>> {
    const page = this.resolvePage(pagination);
    const { from, to } = this.rangeFor(page);

    const { data, error, count } = await this.supabase
      .from('adoption_applications')
      .select(this.applicationSelect, { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(from, to)
      .returns<AdoptionApplicationRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toPaginatedResult(
      (data ?? []).map((row) => this.toApplication(row)),
      page,
      count ?? 0,
    );
  }

  async updateApplicationStatus(
    id: string,
    input: UpdateAdoptionStatusInput,
  ): Promise<AdoptionApplication> {
    const { data, error } = await this.supabase
      .from('adoption_applications')
      .update({
        status: input.status,
        internal_observations: input.internalObservations,
      })
      .eq('id', id)
      .select(this.applicationSelect)
      .single<AdoptionApplicationRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toApplication(data);
  }

  private async softDelete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) throw new InternalServerErrorException(error.message);
  }

  private toHousingType(row: HousingTypeRow): HousingType {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      requiresOtherDetail: row.requires_other_detail,
      isActive: row.is_active,
      orderIndex: row.order_index,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }

  private toApplication(row: AdoptionApplicationRow): AdoptionApplication {
    return {
      id: row.id,
      firstNames: row.first_names,
      lastNames: row.last_names,
      phone: row.phone,
      email: row.email,
      desiredAnimalDescription: row.desired_animal_description,
      adoptionReason: row.adoption_reason,
      specificAnimalId: row.specific_animal_id,
      additionalMessage: row.additional_message,
      dataProcessingAccepted: row.data_processing_accepted,
      dataProcessingAcceptedAt: row.data_processing_accepted_at,
      status: row.status,
      submittedAt: row.submitted_at,
      internalObservations: row.internal_observations,
      notificationStatus: row.notification_status,
      notificationError: row.notification_error,
      updatedAt: row.updated_at,
      rowVersion: row.row_version,
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

  private readonly housingTypeSelect =
    'id, key, name, description, requires_other_detail, is_active, order_index, created_at, updated_at, deleted_at';

  private readonly applicationSelect =
    'id, first_names, last_names, phone, email, desired_animal_description, adoption_reason, specific_animal_id, additional_message, data_processing_accepted, data_processing_accepted_at, status, internal_observations, notification_status, notification_error, submitted_at, updated_at, row_version';
}
