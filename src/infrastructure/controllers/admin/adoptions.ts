import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UpdateAdoptionStatusDto } from '../../../application/dto/adoptions/update-adoption-status';
import { PaginationQueryDto } from '../../../application/dto/common/pagination-query';
import { GetAdminAdoptionApplicationsUseCase } from '../../../application/use-cases/adoptions/get-admin-adoption-applications';
import { UpdateAdoptionStatusUseCase } from '../../../application/use-cases/adoptions/update-adoption-status';
import type { AdoptionApplication } from '../../../domain/models/adoptions/adoption';
import type { AuthenticatedUser } from '../../../domain/models/auth/authenticated-user';
import type { PaginatedResult } from '../../../domain/models/common/pagination';
import { CurrentUser } from '../../http/auth/decorators/current-user';
import { Permissions } from '../../http/auth/decorators/permissions';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

@Controller('admin/adoptions')
@UseGuards(SupabaseAuthGuard, RolesPermissionsGuard)
@Permissions('adoptions.manage')
export class AdminAdoptionsController {
  constructor(
    private readonly getAdminAdoptionApplicationsUseCase: GetAdminAdoptionApplicationsUseCase,
    private readonly updateAdoptionStatusUseCase: UpdateAdoptionStatusUseCase,
  ) {}

  @Get('applications')
  getApplications(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<AdoptionApplication>> {
    return this.getAdminAdoptionApplicationsUseCase.execute(query);
  }

  @Patch('applications/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateAdoptionStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdoptionApplication> {
    return this.updateAdoptionStatusUseCase.execute(id, {
      ...body,
      changedBy: user.id,
    });
  }
}
