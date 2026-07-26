import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateSiteSectionDto } from '../../../application/dto/site-sections/create-site-section';
import { UpdateSiteSectionDto } from '../../../application/dto/site-sections/update-site-section';
import { CreateSiteSectionUseCase } from '../../../application/use-cases/site-sections/create-site-section';
import { DeleteSiteSectionUseCase } from '../../../application/use-cases/site-sections/delete-site-section';
import { GetAdminSiteSectionsUseCase } from '../../../application/use-cases/site-sections/get-admin-site-sections';
import { UpdateSiteSectionUseCase } from '../../../application/use-cases/site-sections/update-site-section';
import type { SiteSection } from '../../../domain/models/site-sections/site-section';
import { Roles } from '../../http/auth/decorators/roles';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

@Controller('admin/site-sections')
@UseGuards(SupabaseAuthGuard, RolesPermissionsGuard)
@Roles('admin')
export class AdminSiteSectionsController {
  constructor(
    private readonly getAdminSiteSectionsUseCase: GetAdminSiteSectionsUseCase,
    private readonly createSiteSectionUseCase: CreateSiteSectionUseCase,
    private readonly updateSiteSectionUseCase: UpdateSiteSectionUseCase,
    private readonly deleteSiteSectionUseCase: DeleteSiteSectionUseCase,
  ) {}

  @Get()
  getSections(): Promise<SiteSection[]> {
    return this.getAdminSiteSectionsUseCase.execute();
  }

  @Post()
  createSection(@Body() body: CreateSiteSectionDto): Promise<SiteSection> {
    return this.createSiteSectionUseCase.execute(body);
  }

  @Patch(':id')
  updateSection(
    @Param('id') id: string,
    @Body() body: UpdateSiteSectionDto,
  ): Promise<SiteSection> {
    return this.updateSiteSectionUseCase.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteSection(@Param('id') id: string): Promise<void> {
    return this.deleteSiteSectionUseCase.execute(id);
  }
}
