import { Inject, Injectable } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  type AuthRepositoryPort,
  type PasswordResetRequestResult,
  type RequestPasswordResetInput,
} from '../../../domain/ports/output/auth-repository';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: AuthRepositoryPort,
  ) {}

  execute(
    input: RequestPasswordResetInput,
  ): Promise<PasswordResetRequestResult> {
    return this.authRepository.requestPasswordReset(input);
  }
}
