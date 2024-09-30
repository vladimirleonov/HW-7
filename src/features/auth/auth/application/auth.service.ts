import { Injectable } from '@nestjs/common';
import { Result } from '../../../../base/types/object-result';
import { UsersPostgresRepository } from '../../../users/infrastructure/postgresql/users-postgres.repository';
import { CryptoService } from '../../../../core/application/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersPostgresRepository: UsersPostgresRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUserByLoginOrEmailAndPassword(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<number>> {
    const user =
      await this.usersPostgresRepository.findByLoginOrEmailField(loginOrEmail);

    if (!user || !(await this.cryptoService.compare(password, user.password))) {
      return Result.unauthorized('Wrong login or password');
    }

    return Result.success(user.id);
  }

  async validateUserById(id: number): Promise<Result> {
    const user = await this.usersPostgresRepository.findById(id);

    if (!user) {
      return Result.notFound('Wrong user id');
    }

    return Result.success();
  }
}
