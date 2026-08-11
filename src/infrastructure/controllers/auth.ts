import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ForgotPasswordDto } from '../../application/dto/auth/forgot-password';
import { LoginDto } from '../../application/dto/auth/login';
import { GetCurrentUserUseCase } from '../../application/use-cases/auth/get-current-user';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user';
import { RequestPasswordResetUseCase } from '../../application/use-cases/auth/request-password-reset';
import type { AuthenticatedUser } from '../../domain/models/auth/authenticated-user';
import { AuthSession } from '../../domain/models/auth/auth-session';
import type { PasswordResetRequestResult } from '../../domain/ports/output/auth-repository';
import { CurrentUser as CurrentUserModel } from '../../domain/models/users/current-user';
import { CurrentUser } from '../http/auth/decorators/current-user';
import { SupabaseAuthGuard } from '../http/auth/guards/supabase-auth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto): Promise<AuthSession> {
    return this.loginUserUseCase.execute(body);
  }

  @Post('forgot-password')
  forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<PasswordResetRequestResult> {
    return this.requestPasswordResetUseCase.execute(body);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<CurrentUserModel> {
    return this.getCurrentUserUseCase.execute(user);
  }
}
