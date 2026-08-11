import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { GetAdminNotificationUseCase } from '../../../application/use-cases/notifications/get-admin-notification';
import { GetAdminNotificationsUseCase } from '../../../application/use-cases/notifications/get-admin-notifications';
import { MarkNotificationAsReadUseCase } from '../../../application/use-cases/notifications/mark-notification-as-read';
import type { AuthenticatedUser } from '../../../domain/models/auth/authenticated-user';
import type { Notification } from '../../../domain/models/notifications/notification';
import { CurrentUser } from '../../http/auth/decorators/current-user';
import { Permissions } from '../../http/auth/decorators/permissions';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

@Controller('admin/notifications')
@UseGuards(SupabaseAuthGuard, RolesPermissionsGuard)
@Permissions('notifications.manage')
export class AdminNotificationsController {
  constructor(
    private readonly getAdminNotificationsUseCase: GetAdminNotificationsUseCase,
    private readonly getAdminNotificationUseCase: GetAdminNotificationUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
  ) {}

  @Get()
  getNotifications(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notification[]> {
    return this.getAdminNotificationsUseCase.execute(user.id);
  }

  @Get(':id')
  getNotification(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notification> {
    return this.getAdminNotificationUseCase.execute(id, user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notification> {
    return this.markNotificationAsReadUseCase.execute(id, user.id);
  }
}
