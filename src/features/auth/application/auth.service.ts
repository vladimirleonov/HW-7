import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';
import { randomUUID } from 'node:crypto';
import { JwtService } from '../../../base/application/jwt.service';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../base/application/crypto.service';
import {
  User,
  UserDocument,
  UserModelType,
} from '../../users/domain/user.entity';
import { JwtPayload } from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import {
  Device,
  DeviceDocument,
  DeviceModelType,
} from '../domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { unixToISOString } from '../../../base/utils/convert-unix-to-iso';
import { DeviceRepository } from '../../users/infrastructure/device.repository';
import { add } from 'date-fns';
import { NodemailerService } from '../../../base/application/nodemailer.service';
import { registrationEmailTemplate } from '../../../base/email-templates/registration-email-template';
import { passwordRecoveryEmailTemplate } from '../../../base/email-templates/password-recovery-email-template';

@Injectable()
export class AuthService {
  constructor(
    private readonly appSettings: AppSettings,
    private readonly deviceRepository: DeviceRepository,
    private readonly jwtService: JwtService,
    private readonly userRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly nodemailerService: NodemailerService,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
    @InjectModel(Device.name) private readonly DeviceModel: DeviceModelType,
  ) {}
  async registration(
    login: string,
    password: string,
    email: string,
  ): Promise<Result<string | null>> {
    // check already exist by email
    const userByEmail: UserDocument | null =
      await this.userRepository.findByEmail(email);
    if (userByEmail) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          {
            field: 'email',
            message: 'User with such credentials already exists',
          },
        ],
        data: null,
      };
    }

    // check already exist by login
    const userByLogin: UserDocument | null =
      await this.userRepository.findByLogin(login);
    if (userByLogin) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          {
            field: 'login',
            message: 'User with such credentials already exists',
          },
        ],
        data: null,
      };
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      password,
      saltRounds,
    );

    // TODO: correct user with nested schema
    const newUser: UserDocument = new this.UserModel({
      login: login,
      password: passwordHash,
      email: email,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 30,
        }),
        isConfirmed: false,
      },
      // TODO: can set default value in schema not to write '' here
      passwordRecovery: {
        recoveryCode: '',
        expirationDate: '',
      },
    });

    await this.userRepository.save(newUser);

    this.nodemailerService.sendEmail(
      newUser.email,
      registrationEmailTemplate(newUser.emailConfirmation.confirmationCode!),
      'Registration Confirmation',
    );

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
  async passwordRecovery(email: string): Promise<Result> {
    const existingUser: UserDocument | null =
      await this.userRepository.findByEmail(email);
    if (!existingUser) {
      return {
        status: ResultStatus.NotFound,
        extensions: [
          {
            field: 'email',
            message: `User with email ${email} does not exist`,
          },
        ],
        data: null,
      };
    }

    // if user exist set new recoveryCode and expirationDate and send email

    const recoveryCode: string = randomUUID();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    // const passwordRecoveryDTO: PasswordRecovery = new PasswordRecovery(
    //     recoveryCode,
    //     expirationDate
    // )

    //const userId: string = existingUser._id.toString()
    //await this.userMongoRepository.updatePasswordRecoveryInfo(userId, passwordRecoveryDTO)

    existingUser.passwordRecovery.recoveryCode = recoveryCode;
    existingUser.passwordRecovery.expirationDate = expirationDate;

    await this.userRepository.save(existingUser);

    await this.nodemailerService.sendEmail(
      email,
      passwordRecoveryEmailTemplate(recoveryCode),
      'Password Recovery',
    );

    await this.userRepository.save(existingUser);

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
  async confirmRegistration(code: string): Promise<Result> {
    const existingUser: UserDocument | null =
      await this.userRepository.findUserByConfirmationCode(code);
    console.log('existingUser', existingUser);
    if (!existingUser) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'code', message: 'Invalid confirmation code' }],
        data: null,
      };
    }

    if (
      existingUser.emailConfirmation.expirationDate < new Date().toISOString()
    ) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          { field: 'code', message: 'Confirmation code has expired' },
        ],
        data: null,
      };
    }

    if (existingUser.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          { field: 'code', message: 'User account already confirmed' },
        ],
        data: null,
      };
    }

    //const isConfirmed: boolean = true
    //const userId: string = existingUser._id.toString()
    //await this.userMongoRepository.updateIsConfirmed(userId, isConfirmed)

    existingUser.emailConfirmation.isConfirmed = true;
    await this.userRepository.save(existingUser);

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
  async registrationEmailResending(email: string): Promise<Result> {
    const existingUser: UserDocument | null =
      await this.userRepository.findByEmail(email);
    if (!existingUser) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'email', message: 'Invalid email' }],
        data: null,
      };
    }

    // hw-9 error in test -> comment this code
    // if (existingUser.emailConfirmation.isConfirmed) {
    //     return {
    //         status: ResultStatus.BadRequest,
    //         extensions: [{field: 'email', message: 'Email already confirmed'}],
    //         data: null
    //     }
    // }

    const confirmationCode: string = randomUUID();
    const expirationDate: string = add(new Date(), {
      hours: 1,
      minutes: 30,
    }).toISOString();

    // const userId: string = existingUser._id.toString()
    // await this.userMongoRepository.updateEmailConfirmationInfo(userId, confirmationCode, expirationDate)

    existingUser.emailConfirmation.confirmationCode = confirmationCode;
    existingUser.emailConfirmation.expirationDate = expirationDate;

    await this.userRepository.save(existingUser);

    // async updateEmailConfirmationInfo(id: string, confirmationCode: string, expirationDate: string): Promise<boolean> {
    //         const updatedInfo: UpdateResult<User> = await UserModel.updateOne(
    //         {_id: new ObjectId(id)},
    //         {
    //             $set: {
    //                 ['emailConfirmation.confirmationCode']: confirmationCode,
    //                 ['emailConfirmation.expirationDate']: expirationDate
    //             }
    //         }
    //     )
    //     return updatedInfo.matchedCount === 1
    // }

    await this.nodemailerService.sendEmail(
      email,
      registrationEmailTemplate(confirmationCode),
      'Registration Confirmation',
    );

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
  async login(dto: LoginDto) {
    // check valid refresh token
    if (dto.refreshToken) {
      try {
        this.jwtService.verifyToken(dto.refreshToken);
        return {
          status: ResultStatus.BadRequest,
          extensions: [
            {
              field: 'refreshToken',
              message:
                'Refresh token is still valid. Logout before logging in again',
            },
          ],
          data: null,
        };
      } catch (err) {
        // console.log('Invalid refresh token, proceeding with login')
      }
    }

    //check user exit and password the same
    const user: UserDocument | null =
      await this.userRepository.findByLoginOrEmailField(dto.loginOrEmail);
    if (
      !user ||
      !(await this.cryptoService.compare(dto.password, user.password))
    ) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [
          { field: 'login or password', message: 'Wrong login or password' },
        ],
        data: null,
      };
    }

    // check is confirmed
    if (!user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        extensions: [{ field: 'email', message: 'Email is not confirmed' }],
        data: null,
      };
    }

    // new payload for access token
    const JwtAccessTokenPayload: JwtPayload = {
      userId: user._id.toString(),
    };

    const deviceId: string = randomUUID();

    // new payload for refresh token
    const JwtRefreshTokenPayload: JwtPayload = {
      userId: user._id.toString(),
      deviceId: deviceId,
    };

    // generate access token
    const accessToken: string = this.jwtService.generateToken(
      JwtAccessTokenPayload,
      '10h',
    );

    //generate refresh token
    const refreshToken: string = this.jwtService.generateToken(
      JwtRefreshTokenPayload,
      '20h',
    );

    const decodedRefreshToken: string | JwtPayload | null =
      this.jwtService.decode(refreshToken);
    if (decodedRefreshToken && typeof decodedRefreshToken !== 'string') {
      const { iat, exp } = decodedRefreshToken;

      const deviceName: string = dto.deviceName;
      const ip: string = dto.ip;

      const newDevice: DeviceDocument = new this.DeviceModel({
        userId: user._id,
        deviceId: decodedRefreshToken.deviceId,
        iat: unixToISOString(iat),
        deviceName: deviceName,
        ip: ip,
        exp: unixToISOString(exp),
      });

      await this.deviceRepository.save(newDevice);

      return {
        status: ResultStatus.Success,
        data: {
          accessToken,
          refreshToken,
        },
      };
    }

    return {
      status: ResultStatus.Unauthorized,
      data: null,
    };
  }
  async logout(deviceId, iat): Promise<Result> {
    // delete user device
    const isDeleted: boolean =
      await this.deviceRepository.deleteOneByDeviceIdAndIAt(deviceId, iat);
    if (!isDeleted) {
      return {
        status: ResultStatus.Unauthorized,
        // TODO: check error message
        extensions: [
          {
            field: 'refreshToken',
            message: 'Invalid or expired refresh token',
          },
        ],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }
  async checkAccessToken(
    authHeader: string,
  ): Promise<Result<JwtPayload | null>> {
    if (!authHeader.startsWith('Bearer ')) {
      return {
        status: ResultStatus.Unauthorized,
        extensions: [
          { field: 'accessToken', message: 'Access token not provided' },
        ],
        data: null,
      };
    }

    const token: string = authHeader.split(' ')[1];
    if (!token) {
      return {
        status: ResultStatus.Unauthorized,
        extensions: [
          { field: 'accessToken', message: 'Access token not provided' },
        ],
        data: null,
      };
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verifyToken(token) as JwtPayload;
      if (!payload || !payload.userId) {
        return {
          status: ResultStatus.Unauthorized,
          extensions: [
            { field: 'accessToken', message: 'Invalid access token!' },
          ],
          data: null,
        };
      }
    } catch (err) {
      console.error('verifyToken', err);
      return {
        status: ResultStatus.Unauthorized,
        extensions: [{ field: 'accessToken', message: 'Invalid access token' }],
        data: null,
      };
    }

    const user: UserDocument | null = await this.userRepository.findById(
      payload.userId,
    );
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        extensions: [{ field: 'accessToken', message: 'User not found' }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      data: payload,
    };
  }
  async checkRefreshToken(token: string): Promise<Result<JwtPayload | null>> {
    const payload: JwtPayload = this.jwtService.verifyToken(
      token,
    ) as JwtPayload;
    if (!payload || !payload.deviceId || !payload.userId) {
      return {
        status: ResultStatus.Unauthorized,
        extensions: [
          { field: 'refreshToken', message: 'Invalid refresh token' },
        ],
        data: null,
      };
    }

    //? check if user exist by userId (may also check match user to deviceId)
    const user: UserDocument | null = await this.userRepository.findById(
      payload.userId,
    );
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        extensions: [{ field: 'accessToken', message: 'User not found' }],
        data: null,
      };
    }

    return {
      status: ResultStatus.Success,
      data: payload,
    };
  }
  async generatePasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.appSettings.api.HASH_ROUNDS);
  }
}
