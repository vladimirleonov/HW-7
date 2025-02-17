import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { Response } from 'express';
import { RegistrationModel } from './models/input/registration.input.model';
import { ConfirmRegistrationModel } from './models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from './models/input/registration-email-resending.model';
import { PasswordRecoveryModel } from './models/input/password-recovery.model';
import { NewPasswordModel } from './models/input/new-password.model';
import { CurrentUserId } from '../../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CurrentDeviceId } from '../../../../core/decorators/param-decorators/current-device-id.param.decorator';
import { CurrentDeviceIat } from '../../../../core/decorators/param-decorators/current-device-iat.param.decorator';
import {
  BadRequestException,
  UnauthorizedException,
} from '../../../../core/exception-filters/http-exception-filter';
import { LocalAuthGuard } from '../../../../core/guards/passport/local-auth.guard';
import { JwtAuthGuard } from '../../../../core/guards/passport/jwt-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../application/use-cases/registration-user.usecase';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.usecase';
import { SetNewPasswordCommand } from '../application/use-cases/set-new-password.usecase';
import { LoginCommand } from '../application/use-cases/login.usecase';
import { LogoutCommand } from '../application/use-cases/logout';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.usecase';
import { ConfirmRegistrationCommand } from '../application/use-cases/confirm-registration.usecase';
import { RefreshTokenAuthGuard } from '../../../../core/guards/passport/refresh-token-auth.guard';
import { CurrentUserIdFromDevice } from '../../../../core/decorators/param-decorators/current-user-id-from-device.param.decorator';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.usecase';
import { Cookie } from '../../../../core/decorators/param-decorators/cookie.param.decorator';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { UserAgent } from '../../../../core/decorators/param-decorators/user-agent.param.decorator';
import { GetAuthMeQuery } from './queries/auth-me.query';
import { AuthMeOutputModel } from './models/output/auth-me.output';

// @UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() registrationModel: RegistrationModel) {
    const { login, password, email } = registrationModel;

    const result: Result<string | null> = await this.commandBus.execute<
      RegistrationUserCommand,
      Result<string | null>
    >(new RegistrationUserCommand(login, password, email));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() confirmRegistrationModel: ConfirmRegistrationModel,
  ) {
    const { code } = confirmRegistrationModel;

    const result: Result = await this.commandBus.execute(
      new ConfirmRegistrationCommand(code),
    );

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body() registrationEmailResendingModel: RegistrationEmailResendingModel,
  ) {
    const { email } = registrationEmailResendingModel;

    const result: Result = await this.commandBus.execute<
      RegistrationEmailResendingCommand,
      Result
    >(new RegistrationEmailResendingCommand(email));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() passwordRecoveryModel: PasswordRecoveryModel) {
    const { email } = passwordRecoveryModel;

    await this.commandBus.execute<PasswordRecoveryCommand, Result>(
      new PasswordRecoveryCommand(email),
    );

    // to prevent user's email detection send NO_CONTENT
    // for user by email not found or email send successfully
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() newPasswordModel: NewPasswordModel) {
    const { newPassword, recoveryCode } = newPasswordModel;

    const result: Result = await this.commandBus.execute<
      SetNewPasswordCommand,
      Result
    >(new SetNewPasswordCommand(newPassword, recoveryCode));

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.extensions!);
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUserId() userId: number,
    @Cookie('refreshToken') refreshToken: string,
    @Ip() ip: string,
    @UserAgent() deviceName: string,
    @Res() res: Response,
  ) {
    const loginResult: Result<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<
      LoginCommand,
      Result<null | { accessToken: string; refreshToken: string }>
    >(new LoginCommand(userId, ip, deviceName, refreshToken));

    if (loginResult.status === ResultStatus.Unauthorized || !loginResult.data) {
      throw new UnauthorizedException(loginResult.errorMessage!);
    }

    res.cookie('refreshToken', loginResult.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    res.status(HttpStatus.OK).send({
      accessToken: loginResult.data?.accessToken,
    });
  }

  @SkipThrottle()
  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @CurrentUserIdFromDevice() userId: string,
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Result<null | { accessToken: string; refreshToken: string }> =
      await this.commandBus.execute<
        RefreshTokenCommand,
        Result<null | { accessToken: string; refreshToken: string }>
      >(new RefreshTokenCommand(userId, deviceId, iat));

    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data.accessToken!,
    });
  }

  @SkipThrottle()
  @Post('logout')
  @UseGuards(RefreshTokenAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Result = await this.commandBus.execute<LogoutCommand, Result>(
      new LogoutCommand(deviceId, iat),
    );

    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }

  @SkipThrottle()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async authMe(@CurrentUserId() userId: number) {
    const user: AuthMeOutputModel = await this.queryBus.execute<
      GetAuthMeQuery,
      AuthMeOutputModel
    >(new GetAuthMeQuery(userId));

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
