import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Notification } from '../../../../domain/models/notifications/notification';
import type { NotificationRepositoryPort } from '../../../../domain/ports/output/notification-repository';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { NotificationRow } from '../types/bdd-supabase';

@Injectable()
export class NotificationSupabaseRepository implements NotificationRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findByRecipient(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select(this.notificationSelect)
      .eq('recipient_user_id', userId)
      .order('created_at', { ascending: false })
      .returns<NotificationRow[]>();

    if (error) throw new InternalServerErrorException(error.message);
    return (data ?? []).map((row) => this.toNotification(row));
  }

  async findByIdForRecipient(
    id: string,
    userId: string,
  ): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select(this.notificationSelect)
      .eq('id', id)
      .eq('recipient_user_id', userId)
      .single<NotificationRow>();

    if (error) throw new NotFoundException('Notification not found');
    return this.toNotification(data);
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('recipient_user_id', userId)
      .select(this.notificationSelect)
      .single<NotificationRow>();

    if (error) throw new NotFoundException('Notification not found');
    return this.toNotification(data);
  }

  private toNotification(row: NotificationRow): Notification {
    return {
      id: row.id,
      recipientUserId: row.recipient_user_id,
      formType: row.form_type,
      adoptionApplicationId: row.adoption_application_id,
      donationOfferId: row.donation_offer_id,
      personName: row.person_name,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      readAt: row.read_at,
      recipientEmail: row.recipient_email,
      emailSubject: row.email_subject,
      emailBody: row.email_body,
      emailStatus: row.email_status,
      emailAttemptCount: row.email_attempt_count,
      emailLastAttemptAt: row.email_last_attempt_at,
      emailSentAt: row.email_sent_at,
      emailError: row.email_error,
      createdAt: row.created_at,
    };
  }

  private readonly notificationSelect =
    'id, recipient_user_id, form_type, adoption_application_id, donation_offer_id, person_name, title, message, is_read, read_at, recipient_email, email_subject, email_body, email_status, email_attempt_count, email_last_attempt_at, email_sent_at, email_error, created_at';
}
