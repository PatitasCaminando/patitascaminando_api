import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Permission } from '../../../../domain/models/access-control/permission';
import type { Role } from '../../../../domain/models/access-control/role';
import type { CurrentUser } from '../../../../domain/models/users/current-user';
import type { Operator } from '../../../../domain/models/users/operator';
import type { Profile } from '../../../../domain/models/users/profile';
import type {
  UpdateOperatorInput,
  UserRepositoryPort,
} from '../../../../domain/ports/output/user-repository';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { StaffProfileRow } from '../types/bdd-supabase';

type AuthUserSummary = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

@Injectable()
export class UserSupabaseRepository implements UserRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabase: SupabaseClient,
  ) {}

  async findCurrentUserById(user: {
    id: string;
    email: string | null;
  }): Promise<CurrentUser> {
    const staffProfile = await this.findStaffProfileById(user.id);

    if (!staffProfile || !staffProfile.is_active) {
      return {
        id: user.id,
        email: user.email,
        profile: null,
        roles: [],
        permissions: [],
      };
    }

    const roles = [this.toRole(staffProfile)];

    return {
      id: user.id,
      email: user.email,
      profile: this.toProfile(staffProfile),
      roles,
      permissions: this.permissionsForRole(staffProfile.role),
    };
  }

  async findProfileByUserId(userId: string): Promise<Profile> {
    const staffProfile = await this.findStaffProfileById(userId);

    if (!staffProfile) {
      throw new InternalServerErrorException('Staff profile not found');
    }

    return this.toProfile(staffProfile);
  }

  async updateProfileByUserId(userId: string): Promise<Profile> {
    return this.findProfileByUserId(userId);
  }

  async findOperators(): Promise<Operator[]> {
    const { data, error } = await this.supabase
      .from('staff_profiles')
      .select(this.staffSelect)
      .eq('role', 'operator')
      .order('created_at', { ascending: false })
      .returns<StaffProfileRow[]>();

    if (error) throw new InternalServerErrorException(error.message);

    const authUsers = await this.findAuthUsersByIds(
      (data ?? []).map((row) => row.id),
    );

    return (data ?? []).map((row) =>
      this.toOperator(row, authUsers.get(row.id)),
    );
  }

  async findOperatorById(id: string): Promise<Operator> {
    const staffProfile = await this.findStaffProfileById(id);

    if (!staffProfile || staffProfile.role !== 'operator') {
      throw new NotFoundException('Operator not found');
    }

    const authUser = await this.findAuthUserById(id);
    return this.toOperator(staffProfile, authUser);
  }

  async updateOperator(
    id: string,
    input: UpdateOperatorInput,
  ): Promise<Operator> {
    const staffProfile = await this.findStaffProfileById(id);

    if (!staffProfile || staffProfile.role !== 'operator') {
      throw new NotFoundException('Operator not found');
    }

    const staffUpdate: Partial<StaffProfileRow> = {};

    if (input.isActive !== undefined) {
      staffUpdate.is_active = input.isActive;
    }

    if (input.receiveFormNotifications !== undefined) {
      staffUpdate.receive_form_notifications = input.receiveFormNotifications;
    }

    if (Object.keys(staffUpdate).length > 0) {
      const { error } = await this.supabase
        .from('staff_profiles')
        .update(staffUpdate)
        .eq('id', id)
        .eq('role', 'operator');

      if (error) throw new InternalServerErrorException(error.message);
    }

    if (
      input.firstNames !== undefined ||
      input.lastNames !== undefined ||
      input.phone !== undefined
    ) {
      const authUser = await this.findAuthUserById(id);
      const metadata = authUser?.user_metadata ?? {};

      const { error } = await this.supabase.auth.admin.updateUserById(id, {
        user_metadata: {
          ...metadata,
          first_names: input.firstNames ?? metadata.first_names ?? null,
          last_names: input.lastNames ?? metadata.last_names ?? null,
          phone: input.phone ?? metadata.phone ?? null,
        },
      });

      if (error) throw new InternalServerErrorException(error.message);
    }

    return this.findOperatorById(id);
  }

  private async findStaffProfileById(
    userId: string,
  ): Promise<StaffProfileRow | null> {
    const { data, error } = await this.supabase
      .from('staff_profiles')
      .select(this.staffSelect)
      .eq('id', userId)
      .maybeSingle<StaffProfileRow>();

    if (error) throw new InternalServerErrorException(error.message);
    return data ?? null;
  }

  private async findAuthUserById(id: string): Promise<AuthUserSummary | null> {
    const { data, error } = await this.supabase.auth.admin.getUserById(id);

    if (error) throw new InternalServerErrorException(error.message);
    return data.user ?? null;
  }

  private async findAuthUsersByIds(
    ids: string[],
  ): Promise<Map<string, AuthUserSummary>> {
    const authUsers = new Map<string, AuthUserSummary>();

    if (ids.length === 0) {
      return authUsers;
    }

    const { data, error } = await this.supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) throw new InternalServerErrorException(error.message);

    const idSet = new Set(ids);
    for (const user of data.users ?? []) {
      if (idSet.has(user.id)) {
        authUsers.set(user.id, user);
      }
    }

    return authUsers;
  }

  private toRole(row: StaffProfileRow): Role {
    return {
      key: row.role,
      name: row.role === 'admin' ? 'Administrador' : 'Operador',
      description: null,
      isInternal: true,
      createdAt: row.created_at,
    };
  }

  private permissionsForRole(role: StaffProfileRow['role']): Permission[] {
    const now = new Date().toISOString();
    const operatorPermissions = [
      'animals.manage',
      'adoptions.manage',
      'donations.manage',
      'notifications.manage',
    ];
    const adminPermissions = [...operatorPermissions, 'users.manage'];

    return (role === 'admin' ? adminPermissions : operatorPermissions).map(
      (key) => ({
        key,
        module: key.split('.')[0],
        description: key,
        createdAt: now,
      }),
    );
  }

  private toProfile(row: StaffProfileRow): Profile {
    return {
      id: row.id,
      avatarId: null,
      firstNames: null,
      lastNames: null,
      phone: null,
      birthDate: null,
      address: null,
      housingSector: null,
      status: row.is_active ? 'active' : 'inactive',
      userType: 'staff',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toOperator(
    row: StaffProfileRow,
    authUser: AuthUserSummary | null | undefined,
  ): Operator {
    const metadata = authUser?.user_metadata ?? {};

    return {
      id: row.id,
      email: authUser?.email ?? null,
      firstNames: this.metadataString(metadata.first_names),
      lastNames: this.metadataString(metadata.last_names),
      phone: this.metadataString(metadata.phone),
      isActive: row.is_active,
      receiveFormNotifications: row.receive_form_notifications,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private metadataString(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  private readonly staffSelect =
    'id, role, is_active, receive_form_notifications, created_at, updated_at';
}
