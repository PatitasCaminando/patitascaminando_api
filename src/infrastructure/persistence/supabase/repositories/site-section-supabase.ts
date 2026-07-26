import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { SiteSection } from '../../../../domain/models/site-sections/site-section';
import type {
  CreateSiteSectionInput,
  SiteSectionRepositoryPort,
  UpdateSiteSectionInput,
} from '../../../../domain/ports/output/site-section-repository';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { SiteSectionRow } from '../types/bdd-supabase';

@Injectable()
export class SiteSectionSupabaseRepository implements SiteSectionRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findPublicSections(): Promise<SiteSection[]> {
    const { data, error } = await this.supabase
      .from('site_sections')
      .select(this.sectionSelect)
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .returns<SiteSectionRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toSection(row));
  }

  async findAdminSections(): Promise<SiteSection[]> {
    const { data, error } = await this.supabase
      .from('site_sections')
      .select(this.sectionSelect)
      .order('display_order', { ascending: true })
      .returns<SiteSectionRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toSection(row));
  }

  async createSection(input: CreateSiteSectionInput): Promise<SiteSection> {
    const { data, error } = await this.supabase
      .from('site_sections')
      .insert({
        section_key: input.sectionKey,
        title: input.title,
        content: input.content ?? {},
        is_published: input.isPublished,
        display_order: input.displayOrder,
      })
      .select(this.sectionSelect)
      .single<SiteSectionRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toSection(data);
  }

  async updateSection(
    id: string,
    input: UpdateSiteSectionInput,
  ): Promise<SiteSection> {
    const { data, error } = await this.supabase
      .from('site_sections')
      .update({
        title: input.title,
        content: input.content,
        is_published: input.isPublished,
        display_order: input.displayOrder,
      })
      .eq('id', id)
      .select(this.sectionSelect)
      .single<SiteSectionRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toSection(data);
  }

  async deleteSection(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('site_sections')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
  }

  private toSection(row: SiteSectionRow): SiteSection {
    return {
      id: row.id,
      sectionKey: row.section_key,
      title: row.title,
      content: row.content,
      isPublished: row.is_published,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private readonly sectionSelect =
    'id, section_key, title, content, is_published, display_order, created_at, updated_at';
}
