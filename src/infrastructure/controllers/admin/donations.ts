import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UpdateDonationStatusDto } from '../../../application/dto/donations/update-donation-status';
import { GetAdminDonationOffersUseCase } from '../../../application/use-cases/donations/get-admin-donation-offers';
import { UpdateDonationStatusUseCase } from '../../../application/use-cases/donations/update-donation-status';
import type { DonationOffer } from '../../../domain/models/donations/donation';
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
  getOffers(): Promise<DonationOffer[]> {
    return this.getAdminDonationOffersUseCase.execute();
  }

  @Patch('offers/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateDonationStatusDto,
  ): Promise<DonationOffer> {
    return this.updateDonationStatusUseCase.execute(id, body);
  }
}
