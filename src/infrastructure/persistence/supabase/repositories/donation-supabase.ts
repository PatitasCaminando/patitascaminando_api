import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { DonationOffer } from '../../../../domain/models/donations/donation';
import type {
  CreateDonationOfferInput,
  DonationRepositoryPort,
  UpdateDonationStatusInput,
} from '../../../../domain/ports/output/donation-repository';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { DonationOfferRow } from '../types/bdd-supabase';

@Injectable()
export class DonationSupabaseRepository implements DonationRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async createOffer(input: CreateDonationOfferInput): Promise<DonationOffer> {
    const { data, error } = await this.supabase
      .from('donation_offers')
      .insert({
        first_names: input.firstNames,
        last_names: input.lastNames,
        phone: input.phone,
        email: input.email,
        selected_items: input.selectedItems,
        approximate_quantity: input.approximateQuantity,
        product_name: input.productName,
        item_condition: input.itemCondition,
        expiration_date: input.expirationDate,
        delivery_availability: input.deliveryAvailability,
        other_description: input.otherDescription,
        description_observation: input.descriptionObservation,
        data_processing_accepted: input.dataProcessingAccepted,
      })
      .select(this.offerSelect)
      .single<DonationOfferRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toOffer(data);
  }

  async findAdminOffers(): Promise<DonationOffer[]> {
    const { data, error } = await this.supabase
      .from('donation_offers')
      .select(this.offerSelect)
      .order('submitted_at', { ascending: false })
      .returns<DonationOfferRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toOffer(row));
  }

  async updateOfferStatus(
    id: string,
    input: UpdateDonationStatusInput,
  ): Promise<DonationOffer> {
    const { data, error } = await this.supabase
      .from('donation_offers')
      .update({
        status: input.status,
        internal_observations: input.internalObservations,
      })
      .eq('id', id)
      .select(this.offerSelect)
      .single<DonationOfferRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return this.toOffer(data);
  }

  private toOffer(row: DonationOfferRow): DonationOffer {
    return {
      id: row.id,
      firstNames: row.first_names,
      lastNames: row.last_names,
      phone: row.phone,
      email: row.email,
      selectedItems: row.selected_items,
      approximateQuantity: row.approximate_quantity,
      productName: row.product_name,
      itemCondition: row.item_condition,
      expirationDate: row.expiration_date,
      deliveryAvailability: row.delivery_availability,
      otherDescription: row.other_description,
      descriptionObservation: row.description_observation,
      dataProcessingAccepted: row.data_processing_accepted,
      dataProcessingAcceptedAt: row.data_processing_accepted_at,
      status: row.status,
      internalObservations: row.internal_observations,
      notificationStatus: row.notification_status,
      notificationError: row.notification_error,
      submittedAt: row.submitted_at,
      updatedAt: row.updated_at,
      rowVersion: row.row_version,
    };
  }

  private readonly offerSelect =
    'id, first_names, last_names, phone, email, selected_items, approximate_quantity, product_name, item_condition, expiration_date, delivery_availability, other_description, description_observation, data_processing_accepted, data_processing_accepted_at, status, internal_observations, notification_status, notification_error, submitted_at, updated_at, row_version';
}
