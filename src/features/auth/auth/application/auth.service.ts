import { Injectable } from '@nestjs/common';
import { Result } from '../../../../base/types/object-result';
import { UsersTypeormRepository } from '../../../users/infrastructure/typeorm/users-typeorm.repository';
import { CryptoService } from '../../../../core/application/crypto.service';
import { User } from '../../../users/domain/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersTypeormRepository: UsersTypeormRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  // local-strategy
  async validateUserByLoginOrEmailAndPassword(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<number>> {
    const user =
      await this.usersTypeormRepository.findByLoginOrEmailField(loginOrEmail);

    if (!user || !(await this.cryptoService.compare(password, user.password))) {
      return Result.unauthorized('Wrong login or password');
    }

    return Result.success(user.id);
  }

  // jwt-strategy; refresh-token-strategy
  async validateUserById(id: number): Promise<Result> {
    const user: User | null = await this.usersTypeormRepository.findById(id);

    if (!user) {
      return Result.notFound('Wrong user id');
    }

    return Result.success();
  }
}
