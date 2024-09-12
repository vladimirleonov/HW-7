import { Injectable } from '@nestjs/common';
import { Result } from '../../../../base/types/object-result';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserDocument } from '../../../users/domain/user.entity';
import { CryptoService } from '../../../../core/application/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUserByLoginOrEmailAndPassword(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<string>> {
    const user: UserDocument | null =
      await this.userRepository.findByLoginOrEmailField(loginOrEmail);

    if (!user || !(await this.cryptoService.compare(password, user.password))) {
      return Result.unauthorized('Wrong login or password');
    }

    return Result.success(user.id);
  }

  async validateUserById(id: string): Promise<Result> {
    const user: UserDocument | null = await this.userRepository.findById(id);

    if (!user) {
      return Result.notFound('Wrong user id');
    }

    return Result.success();
  }
}
