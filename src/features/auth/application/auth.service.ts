import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';
import { randomUUID } from 'node:crypto';
import { JwtService } from '../../../../base/application/jwt.service';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../base/application/crypto.service';
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
import { unixToISOString } from '../../../../base/utils/convert-unix-to-iso';
import { DeviceRepository } from '../../users/infrastructure/device.repository';
import { add } from 'date-fns';
import { NodemailerService } from '../../../../base/application/nodemailer.service';
import { registrationEmailTemplate } from '../../../../base/email-templates/registration-email-template';

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
      await this.userRepository.findUserByLoginOrEmailField(dto.loginOrEmail);
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
  async generatePasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.appSettings.api.HASH_ROUNDS);
  }
}
