import type {
  SiteSection,
  SiteSectionKey,
} from '../../models/site-sections/site-section';

export const SITE_SECTION_REPOSITORY = Symbol('SITE_SECTION_REPOSITORY');

export interface CreateSiteSectionInput {
  sectionKey: SiteSectionKey;
  title?: string;
  content?: Record<string, unknown>;
  isPublished?: boolean;
  displayOrder?: number;
}

export interface UpdateSiteSectionInput {
  title?: string;
  content?: Record<string, unknown>;
  isPublished?: boolean;
  displayOrder?: number;
}

export interface SiteSectionRepositoryPort {
  findPublicSections(): Promise<SiteSection[]>;
  findAdminSections(): Promise<SiteSection[]>;
  createSection(input: CreateSiteSectionInput): Promise<SiteSection>;
  updateSection(
    id: string,
    input: UpdateSiteSectionInput,
  ): Promise<SiteSection>;
  deleteSection(id: string): Promise<void>;
}
