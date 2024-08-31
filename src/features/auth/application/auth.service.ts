import { Injectable } from '@nestjs/common';
import { AppSettings } from '../../../settings/app-settings';
import { randomUUID } from 'node:crypto';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { UsersRepository } from '../../users/infrastructure/users.repository';
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
} from '../../security/domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceRepository } from '../../security/infrastructure/device.repository';
import { add } from 'date-fns';
import { unixToISOString } from '../../../core/utils/convert-unix-to-iso';
import { NodemailerService } from '../../../core/application/nodemailer.service';
import { registrationEmailTemplate } from '../../../core/email-templates/registration-email-template';
import { passwordRecoveryEmailTemplate } from '../../../core/email-templates/password-recovery-email-template';
import { CryptoService } from '../../../core/application/crypto.service';
import { JwtService } from '../../../core/application/jwt.service';

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
    const userByEmail: UserDocument | null =
      await this.userRepository.findByEmail(email);

    if (userByEmail) {
      return Result.badRequest('User with such credentials already exists');
    }

    const userByLogin: UserDocument | null =
      await this.userRepository.findByLogin(login);

    if (userByLogin) {
      return Result.badRequest('User with such credentials already exists');
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

    return Result.success();
  }

  async passwordRecovery(email: string): Promise<Result> {
    const existingUser: UserDocument | null =
      await this.userRepository.findByEmail(email);

    if (!existingUser) {
      return Result.notFound(`User with email ${email} does not exist`);
    }

    const recoveryCode: string = randomUUID();
    const expirationDate: Date = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    existingUser.passwordRecovery.recoveryCode = recoveryCode;
    existingUser.passwordRecovery.expirationDate = expirationDate;

    await this.userRepository.save(existingUser);

    this.nodemailerService.sendEmail(
      email,
      passwordRecoveryEmailTemplate(recoveryCode),
      'Password Recovery',
    );

    await this.userRepository.save(existingUser);

    return Result.success();
  }

  async setNewPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<Result> {
    const user: UserDocument | null =
      await this.userRepository.findUserByRecoveryCode(recoveryCode);

    if (!user) {
      return Result.badRequest('Incorrect recovery code');
    }

    const currentDate: Date = new Date();
    const expirationDate: Date = user.passwordRecovery.expirationDate;

    if (expirationDate < currentDate) {
      return Result.badRequest('Recovery code has expired');
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      newPassword,
      saltRounds,
    );

    user.password = passwordHash;
    user.passwordRecovery.recoveryCode = ''; // set '' after successful update
    user.passwordRecovery.expirationDate = new Date(); // set current date after successful update

    await this.userRepository.save(user);

    return Result.success();
  }

  async confirmRegistration(code: string): Promise<Result> {
    const existingUser: UserDocument | null =
      await this.userRepository.findUserByConfirmationCode(code);

    if (!existingUser) {
      return Result.badRequest('Invalid confirmation code');
    }

    if (
      existingUser.emailConfirmation.expirationDate < new Date().toISOString()
    ) {
      return Result.badRequest('Confirmation code has expired');
    }

    if (existingUser.emailConfirmation.isConfirmed) {
      return Result.badRequest('User account already confirmed');
    }

    existingUser.emailConfirmation.isConfirmed = true;

    await this.userRepository.save(existingUser);

    return Result.success();
  }

  async registrationEmailResending(email: string): Promise<Result> {
    const existingUser: UserDocument | null =
      await this.userRepository.findByEmail(email);

    if (!existingUser) {
      return Result.badRequest('Invalid email provided');
    }

    // hw-9 error in test -> comment this code
    if (existingUser.emailConfirmation.isConfirmed) {
      return Result.badRequest('Email already confirmed');
    }

    const confirmationCode: string = randomUUID();
    const expirationDate: string = add(new Date(), {
      hours: 1,
      minutes: 30,
    }).toISOString();

    existingUser.emailConfirmation.confirmationCode = confirmationCode;
    existingUser.emailConfirmation.expirationDate = expirationDate;

    await this.userRepository.save(existingUser);

    this.nodemailerService.sendEmail(
      email,
      registrationEmailTemplate(confirmationCode),
      'Registration Confirmation',
    );

    return {
      status: ResultStatus.Success,
      data: null,
    };
  }

  async validateUser(
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

  async login(dto: LoginDto): Promise<
    Result<{
      accessToken: string;
      refreshToken: string;
    } | null>
  > {
    if (dto.refreshToken) {
      try {
        this.jwtService.verifyToken(dto.refreshToken);

        return Result.unauthorized(
          'Refresh token is still valid. Logout before logging in again',
        );
      } catch (err) {
        // console.log('Invalid refresh token, proceeding with login')
      }
    }

    const user: UserDocument | null = await this.userRepository.findById(
      dto.userId,
    );

    if (!user) {
      return Result.unauthorized('User not found');
    }

    if (!user.emailConfirmation.isConfirmed) {
      return Result.unauthorized('Email is not confirmed');
    }

    // new payload for access token
    const JwtAccessTokenPayload: JwtPayload = {
      userId: dto.userId,
    };

    const deviceId: string = randomUUID();

    // new payload for refresh token
    const JwtRefreshTokenPayload: JwtPayload = {
      userId: dto.userId,
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
        userId: dto.userId,
        deviceId: decodedRefreshToken.deviceId,
        iat: unixToISOString(iat),
        deviceName: deviceName,
        ip: ip,
        exp: unixToISOString(exp),
      });

      await this.deviceRepository.save(newDevice);

      return Result.success({
        accessToken,
        refreshToken,
      });
    }

    return Result.unauthorized();
  }

  async logout(deviceId: string, iat: string): Promise<Result> {
    const isDeleted: boolean =
      await this.deviceRepository.deleteOneByDeviceIdAndIAt(deviceId, iat);

    if (!isDeleted) {
      // TODO: check error message
      return Result.unauthorized('Invalid or expired refresh token');
    }

    return Result.success();
  }

  async checkAccessToken(
    authHeader: string,
  ): Promise<Result<JwtPayload | null>> {
    if (!authHeader.startsWith('Bearer ')) {
      return Result.unauthorized('Access token not provided');
    }

    const token: string = authHeader.split(' ')[1];

    if (!token) {
      return Result.unauthorized('Access token not provided');
    }

    let payload: JwtPayload;

    try {
      payload = this.jwtService.verifyToken(token) as JwtPayload;
      if (!payload || !payload.userId) {
        return Result.unauthorized('Invalid access token!');
      }
    } catch (err) {
      console.error('verify access token', err);
      return Result.unauthorized('Invalid access token');
    }

    const user: UserDocument | null = await this.userRepository.findById(
      payload.userId,
    );

    if (!user) {
      return Result.unauthorized('User not found');
    }

    return Result.success(payload);
  }

  async checkRefreshToken(token: string): Promise<Result<JwtPayload | null>> {
    const payload: JwtPayload = this.jwtService.verifyToken(
      token,
    ) as JwtPayload;

    if (!payload || !payload.deviceId || !payload.userId) {
      return Result.unauthorized('Invalid refresh token');
    }

    //? check if user exist by userId (may also check match user to deviceId)
    const user: UserDocument | null = await this.userRepository.findById(
      payload.userId,
    );

    if (!user) {
      return Result.unauthorized('User not found');
    }

    return Result.success(payload);
  }
}
