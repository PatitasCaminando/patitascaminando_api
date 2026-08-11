import { Inject, Injectable } from '@nestjs/common';
import type { Notification } from '../../../domain/models/notifications/notification';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from '../../../domain/ports/output/notification-repository';

@Injectable()
export class GetAdminNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  execute(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByRecipient(userId);
  }
}
