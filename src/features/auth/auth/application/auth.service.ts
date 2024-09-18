import { Injectable } from '@nestjs/common';
import { Result } from '../../../../base/types/object-result';
import { UserDocument } from '../../../users/domain/user.entity';
import { CryptoService } from '../../../../core/application/crypto.service';
import { UsersPostgresqlRepository } from '../../../users/infrastructure/postgresql/users-postgresql.repository';

@Injectable()
export class AuthService {
  constructor(
    // private readonly userRepository: UsersMongoRepository,
    private readonly usersPostgresqlRepository: UsersPostgresqlRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async validateUserByLoginOrEmailAndPassword(
    loginOrEmail: string,
    password: string,
  ): Promise<any> {
    // const user: UserDocument | null =
    //   await this.usersPostgresqlRepository.findByLoginOrEmailField(
    //     loginOrEmail,
    //   );
    //
    // if (!user || !(await this.cryptoService.compare(password, user.password))) {
    //   return Result.unauthorized('Wrong login or password');
    // }
    //
    // return Result.success(user.id);
    return Result.success('123');
  }

  async validateUserById(id: string): Promise<Result> {
    // const user: UserDocument | null =
    //   await this.usersPostgresqlRepository.findById(id);
    //
    // if (!user) {
    //   return Result.notFound('Wrong user id');
    // }

    return Result.success();
  }
}
