import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Permission } from '../../../../domain/models/access-control/permission';
import type { Role } from '../../../../domain/models/access-control/role';
import type { CurrentUser } from '../../../../domain/models/users/current-user';
import type { Profile } from '../../../../domain/models/users/profile';
import type { UserRepositoryPort } from '../../../../domain/ports/output/user-repository';
import { SUPABASE_ADMIN_CLIENT } from '../supabase.tokens';
import type { StaffProfileRow } from '../types/bdd-supabase';

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

  private readonly staffSelect =
    'id, role, is_active, receive_form_notifications, created_at, updated_at';
}
