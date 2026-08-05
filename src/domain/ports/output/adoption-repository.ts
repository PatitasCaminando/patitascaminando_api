import type {
  AdoptionApplication,
  AdoptionStatus,
  HousingType,
} from '../../models/adoptions/adoption';
import type {
  PaginatedResult,
  PaginationInput,
} from '../../models/common/pagination';

export const ADOPTION_REPOSITORY = Symbol('ADOPTION_REPOSITORY');

export interface CreateHousingTypeInput {
  key: string;
  name: string;
  description?: string;
  requiresOtherDetail?: boolean;
  isActive?: boolean;
  orderIndex?: number;
}

export interface UpdateHousingTypeInput {
  key?: string;
  name?: string;
  description?: string;
  requiresOtherDetail?: boolean;
  isActive?: boolean;
  orderIndex?: number;
}

export interface CreateAdoptionApplicationInput {
  firstNames: string;
  lastNames: string;
  phone: string;
  email: string;
  desiredAnimalDescription: string;
  adoptionReason: string;
  specificAnimalId?: string;
  additionalMessage?: string;
  dataProcessingAccepted: boolean;
}

export interface UpdateAdoptionStatusInput {
  status: AdoptionStatus;
  internalObservations?: string;
  changedBy?: string;
}

export interface AdoptionRepositoryPort {
  findPublicHousingTypes(): Promise<HousingType[]>;
  findAdminHousingTypes(): Promise<HousingType[]>;
  createHousingType(input: CreateHousingTypeInput): Promise<HousingType>;
  updateHousingType(
    id: string,
    input: UpdateHousingTypeInput,
  ): Promise<HousingType>;
  deleteHousingType(id: string): Promise<void>;
  createApplication(
    input: CreateAdoptionApplicationInput,
  ): Promise<AdoptionApplication>;
  findMyApplications(userId: string): Promise<AdoptionApplication[]>;
  findAdminApplications(
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<AdoptionApplication>>;
  updateApplicationStatus(
    id: string,
    input: UpdateAdoptionStatusInput,
  ): Promise<AdoptionApplication>;
}
