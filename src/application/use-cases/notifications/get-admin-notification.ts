import { Inject, Injectable } from '@nestjs/common';
import type { Notification } from '../../../domain/models/notifications/notification';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepositoryPort,
} from '../../../domain/ports/output/notification-repository';

@Injectable()
export class GetAdminNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  execute(id: string, userId: string): Promise<Notification> {
    return this.notificationRepository.findByIdForRecipient(id, userId);
  }
}
