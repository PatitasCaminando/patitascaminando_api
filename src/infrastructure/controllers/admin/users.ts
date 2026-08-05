import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateOperatorDto } from '../../../application/dto/admin/create-operator';
import { UpdateOperatorDto } from '../../../application/dto/admin/update-operator';
import { UpdateOperatorStatusDto } from '../../../application/dto/admin/update-operator-status';
import { CreateOperatorUseCase } from '../../../application/use-cases/admin/create-operator';
import { GetOperatorUseCase } from '../../../application/use-cases/admin/get-operator';
import { GetOperatorsUseCase } from '../../../application/use-cases/admin/get-operators';
import { UpdateOperatorUseCase } from '../../../application/use-cases/admin/update-operator';
import { UpdateOperatorStatusUseCase } from '../../../application/use-cases/admin/update-operator-status';
import type { AuthenticatedUser } from '../../../domain/models/auth/authenticated-user';
import type { RegisteredUser } from '../../../domain/models/auth/registered-user';
import type { Operator } from '../../../domain/models/users/operator';
import type { CreateOperatorInput } from '../../../domain/ports/output/auth-repository';
import { CurrentUser } from '../../http/auth/decorators/current-user';
import { Roles } from '../../http/auth/decorators/roles';
import { RolesPermissionsGuard } from '../../http/auth/guards/roles-permissions';
import { SupabaseAuthGuard } from '../../http/auth/guards/supabase-auth';

@Controller('admin/users')
@UseGuards(SupabaseAuthGuard, RolesPermissionsGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(
    private readonly createOperatorUseCase: CreateOperatorUseCase,
    private readonly getOperatorsUseCase: GetOperatorsUseCase,
    private readonly getOperatorUseCase: GetOperatorUseCase,
    private readonly updateOperatorUseCase: UpdateOperatorUseCase,
    private readonly updateOperatorStatusUseCase: UpdateOperatorStatusUseCase,
  ) {}

  @Get('operators')
  getOperators(): Promise<Operator[]> {
    return this.getOperatorsUseCase.execute();
  }

  @Get('operators/:id')
  getOperator(@Param('id') id: string): Promise<Operator> {
    return this.getOperatorUseCase.execute(id);
  }

  @Post('operators')
  async createOperator(
    @Body() body: CreateOperatorDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RegisteredUser> {
    const input: CreateOperatorInput = {
      email: body.email,
      password: body.password,
      firstNames: body.firstNames,
      lastNames: body.lastNames,
      phone: body.phone,
      assignedBy: user.id,
    };

    const operator: unknown = await this.createOperatorUseCase.execute(input);

    if (!this.isRegisteredUser(operator)) {
      throw new InternalServerErrorException('Invalid operator response');
    }

    return operator;
  }

  @Patch('operators/:id')
  updateOperator(
    @Param('id') id: string,
    @Body() body: UpdateOperatorDto,
  ): Promise<Operator> {
    return this.updateOperatorUseCase.execute(id, body);
  }

  @Patch('operators/:id/status')
  updateOperatorStatus(
    @Param('id') id: string,
    @Body() body: UpdateOperatorStatusDto,
  ): Promise<Operator> {
    return this.updateOperatorStatusUseCase.execute(id, body.isActive);
  }

  private isRegisteredUser(value: unknown): value is RegisteredUser {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<RegisteredUser>;

    return (
      typeof candidate.id === 'string' &&
      (typeof candidate.email === 'string' || candidate.email === null)
    );
  }
}
