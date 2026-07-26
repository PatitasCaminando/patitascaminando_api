export type SiteSectionKey =
  'rescatistas' | 'bienestar_animal' | 'contacto' | 'redes_sociales';

export interface SiteSection {
  id: string;
  sectionKey: SiteSectionKey;
  title: string | null;
  content: Record<string, unknown>;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
