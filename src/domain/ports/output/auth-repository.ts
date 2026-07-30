import type { AuthSession } from '../../models/auth/auth-session';
import type { RegisteredUser } from '../../models/auth/registered-user';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface PasswordResetRequestResult {
  message: string;
}

export interface CreateOperatorInput {
  email: string;
  password: string;
  firstNames?: string;
  lastNames?: string;
  phone?: string;
  assignedBy: string;
}

export interface AuthRepositoryPort {
  login(input: LoginUserInput): Promise<AuthSession>;
  requestPasswordReset(
    input: RequestPasswordResetInput,
  ): Promise<PasswordResetRequestResult>;
  createOperator(input: CreateOperatorInput): Promise<RegisteredUser>;
}
