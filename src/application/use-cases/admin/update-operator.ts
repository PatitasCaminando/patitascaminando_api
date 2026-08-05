import { Inject, Injectable } from '@nestjs/common';
import type { Operator } from '../../../domain/models/users/operator';
import {
  USER_REPOSITORY,
  type UpdateOperatorInput,
  type UserRepositoryPort,
} from '../../../domain/ports/output/user-repository';

@Injectable()
export class UpdateOperatorUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  execute(id: string, input: UpdateOperatorInput): Promise<Operator> {
    return this.userRepository.updateOperator(id, input);
  }
}
