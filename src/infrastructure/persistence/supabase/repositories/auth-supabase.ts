import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AuthSession } from '../../../../domain/models/auth/auth-session';
import type { RegisteredUser } from '../../../../domain/models/auth/registered-user';
import type {
  AuthRepositoryPort,
  CreateOperatorInput,
  LoginUserInput,
} from '../../../../domain/ports/output/auth-repository';
import {
  SUPABASE_ADMIN_CLIENT,
  SUPABASE_PUBLIC_CLIENT,
} from '../supabase.tokens';

@Injectable()
export class AuthSupabaseRepository implements AuthRepositoryPort {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdmin: SupabaseClient,
    @Inject(SUPABASE_PUBLIC_CLIENT)
    private readonly supabasePublic: SupabaseClient,
  ) {}

  async createOperator(input: CreateOperatorInput): Promise<RegisteredUser> {
    const user = await this.createAuthUser(input);

    await this.ensureStaffProfile(user.id, 'operator');

    return user;
  }

  async login(input: LoginUserInput): Promise<AuthSession> {
    const { data, error } = await this.supabasePublic.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (!data.session || !data.user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      tokenType: data.session.token_type,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at ?? null,
      user: {
        id: data.user.id,
        email: data.user.email ?? null,
      },
    };
  }

  private async createAuthUser(input: {
    email: string;
    password: string;
    firstNames?: string;
    lastNames?: string;
    phone?: string;
  }): Promise<RegisteredUser> {
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        first_names: input.firstNames ?? null,
        last_names: input.lastNames ?? null,
        phone: input.phone ?? null,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user) {
      throw new InternalServerErrorException('User was not created');
    }

    return {
      id: data.user.id,
      email: data.user.email ?? null,
    };
  }

  private async ensureStaffProfile(
    userId: string,
    role: 'admin' | 'operator',
  ): Promise<void> {
    const { error } = await this.supabaseAdmin.from('staff_profiles').upsert(
      {
        id: userId,
        role,
        is_active: true,
        receive_form_notifications: role === 'admin',
      },
      {
        onConflict: 'id',
      },
    );

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
