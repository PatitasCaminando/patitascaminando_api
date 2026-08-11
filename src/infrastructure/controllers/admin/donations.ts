import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../../application/dto/common/pagination-query';
import { UpdateDonationStatusDto } from '../../../application/dto/donations/update-donation-status';
import { GetAdminDonationOffersUseCase } from '../../../application/use-cases/donations/get-admin-donation-offers';
import { UpdateDonationStatusUseCase } from '../../../application/use-cases/donations/update-donation-status';
import type { DonationOffer } from '../../../domain/models/donations/donation';
import type { PaginatedResult } from '../../../domain/models/common/pagination';
import { Permissions } from '../../http/auth/decorators/permissions';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

@Controller('admin/donations')
@UseGuards(SupabaseAuthGuard, RolesPermissionsGuard)
@Permissions('donations.manage')
export class AdminDonationsController {
  constructor(
    private readonly getAdminDonationOffersUseCase: GetAdminDonationOffersUseCase,
    private readonly updateDonationStatusUseCase: UpdateDonationStatusUseCase,
  ) {}

  @Get('offers')
  getOffers(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<DonationOffer>> {
    return this.getAdminDonationOffersUseCase.execute(query);
  }

  @Patch('offers/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateDonationStatusDto,
  ): Promise<DonationOffer> {
    return this.updateDonationStatusUseCase.execute(id, body);
  }
}
