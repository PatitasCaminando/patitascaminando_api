import { Controller, Get } from '@nestjs/common';
import { GetPublicSiteSectionsUseCase } from '../../../application/use-cases/site-sections/get-public-site-sections';
import type { SiteSection } from '../../../domain/models/site-sections/site-section';

@Controller('public/site-sections')
export class PublicSiteSectionsController {
  constructor(
    private readonly getPublicSiteSectionsUseCase: GetPublicSiteSectionsUseCase,
  ) {}

  @Get()
  getSections(): Promise<SiteSection[]> {
    return this.getPublicSiteSectionsUseCase.execute();
  }
}
