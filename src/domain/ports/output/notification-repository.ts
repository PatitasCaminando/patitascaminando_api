import type { Notification } from '../../models/notifications/notification';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface NotificationRepositoryPort {
  findByRecipient(userId: string): Promise<Notification[]>;
  findByIdForRecipient(id: string, userId: string): Promise<Notification>;
  markAsRead(id: string, userId: string): Promise<Notification>;
}
