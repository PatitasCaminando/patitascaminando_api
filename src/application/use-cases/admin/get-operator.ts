import { Inject, Injectable } from '@nestjs/common';
import type { Operator } from '../../../domain/models/users/operator';
import {
  USER_REPOSITORY,
  type UserRepositoryPort,
} from '../../../domain/ports/output/user-repository';

@Injectable()
export class GetOperatorUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  execute(id: string): Promise<Operator> {
    return this.userRepository.findOperatorById(id);
  }
}
