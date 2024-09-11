import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { Response } from 'express';
import { RegistrationModel } from './models/input/registration.input.model';
import { ConfirmRegistrationModel } from './models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from './models/input/registration-email-resending.model';
import { AuthMeOutputModel } from './models/output/auth-me.output';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { PasswordRecoveryModel } from './models/input/password-recovery.model';
import { NewPasswordModel } from './models/input/new-password.model';
import { RateLimitGuard } from '../../../core/guards/custom/rate-limit.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.param.decorator';
import { CurrentDeviceIat } from '../../../core/decorators/param-decorators/current-device-iat.param.decorator';
import { UtilsService } from '../../../core/application/utils.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '../../../core/exception-filters/http-exception-filter';
import { RequestWithCookies } from '../../../base/types/request-with-cookie';
import { LocalAuthGuard } from '../../../core/guards/passport/local-auth.guard';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationUserCommand } from '../application/use-cases/registration-user.usecase';
import { PasswordRecoveryCommand } from '../application/use-cases/password-recovery.usecase';
import { SetNewPasswordCommand } from '../application/use-cases/set-new-password.usecase';
import { LoginCommand } from '../application/use-cases/login.usecase';
import { LogoutCommand } from '../application/use-cases/logout';
import { RegistrationEmailResendingCommand } from '../application/use-cases/registration-email-resending.usecase';
import { ConfirmRegistrationCommand } from '../application/use-cases/confirm-registration.usecase';
import { RefreshTokenAuthGuard } from '../../../core/guards/passport/refresh-token-auth.guard';
import { ClearCookieInterceptor } from '../../../core/interceptors/clear-cookie.interceptor';
import { CurrentUserIdFromDevice } from '../../../core/decorators/param-decorators/current-user-id-from-device.param.decorator';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.usecase';
import { OptionalJwtAuthGuard } from '../../../core/guards/passport/optional-jwt-auth-guard';
import { Cookie } from '../../../core/decorators/param-decorators/cookie.param.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly utilsService: UtilsService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('registration')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registration(@Body() registrationModel: RegistrationModel) {
    const { login, password, email } = registrationModel;

    const result: Result<string | null> = await this.commandBus.execute<
      RegistrationUserCommand,
      Result<string | null>
    >(new RegistrationUserCommand(login, password, email));

    // const result: Result<string | null> = await this.authService.registration(login, password, email);

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
    }
  }

  @Post('registration-confirmation')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async confirmRegistration(
    @Body() confirmRegistrationModel: ConfirmRegistrationModel,
  ) {
    const { code } = confirmRegistrationModel;

    const result: Result<boolean | null> = await this.commandBus.execute(
      new ConfirmRegistrationCommand(code),
    );

    // const result: Result<boolean | null> =
    //   await this.authService.confirmRegistration(code);

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
    }
  }

  @Post('registration-email-resending')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registrationEmailResending(
    @Body() registrationEmailResendingModel: RegistrationEmailResendingModel,
  ) {
    const { email } = registrationEmailResendingModel;

    const result: Result = await this.commandBus.execute<
      RegistrationEmailResendingCommand,
      Result
    >(new RegistrationEmailResendingCommand(email));

    // const result: Result =
    //   await this.authService.registrationEmailResending(email);

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
    }
  }

  @Post('password-recovery')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() passwordRecoveryModel: PasswordRecoveryModel) {
    const { email } = passwordRecoveryModel;

    await this.commandBus.execute(new PasswordRecoveryCommand(email));

    // await this.authService.passwordRecovery(email);

    // to prevent user's email detection send NO_CONTENT
    // for user by email not found or email send successfully
  }

  @Post('new-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async newPassword(@Body() newPasswordModel: NewPasswordModel) {
    const { newPassword, recoveryCode } = newPasswordModel;

    const result: Result = await this.commandBus.execute(
      new SetNewPasswordCommand(newPassword, recoveryCode),
    );

    // const result: Result = await this.authService.setNewPassword(
    //   newPassword,
    //   recoveryCode,
    // );

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
    }
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(RateLimitGuard)
  async login(
    @Req() req: RequestWithCookies,
    @CurrentUserId() userId: string,
    @Cookie('refreshToken') refreshToken: string,
    @Res() res: Response,
  ) {
    // console.log('in login controller');
    const ip: string = this.utilsService.getIpAddress(req);
    const deviceName: string = this.utilsService.getDeviceName(req);
    console.log(ip);
    console.log(deviceName);

    //
    // // TODO: use decorator or no?
    // const refreshToken: string = req.cookies?.refreshToken;
    //
    // // const dto: LoginDto = new LoginDto(userId, ip, deviceName, refreshToken);

    const loginResult = await this.commandBus.execute(
      new LoginCommand(userId, ip, deviceName, refreshToken),
    );
    if (loginResult.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException(loginResult.errorMessage!);
    }

    // // const loginResult = await this.authService.login(dto);
    // // if (loginResult.status === ResultStatus.Unauthorized) {
    // //   throw new UnauthorizedException(loginResult.errorMessage!);
    // // }
    //
    // // const loginResult = await this.authService.login(dto);
    // // if (loginResult.status === ResultStatus.Unauthorized) {
    // //   throw new UnauthorizedException(loginResult.errorMessage!);
    // // }
    //

    console.log('Set-Cookie:', res.getHeaders()['set-cookie']);

    res.cookie('refreshToken', loginResult.data.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    console.log('Set-Cookie:', res.getHeaders()['set-cookie']);

    res.status(HttpStatus.OK).send({
      accessToken: loginResult.data?.accessToken,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async authMe(@CurrentUserId() userId: string) {
    const user: AuthMeOutputModel | null =
      await this.usersQueryRepository.findAuthenticatedUserById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenAuthGuard)
  // @UseInterceptors(SetCookieInterceptor)
  @HttpCode(200)
  async refreshToken(
    @CurrentUserIdFromDevice() userId: string,
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    console.log('ok!!!');
    const result = await this.commandBus.execute(
      new RefreshTokenCommand(userId, deviceId, iat),
    );

    // const result: Result<{
    //   accessToken: string,
    //   refreshToken: string
    // } | null> = await this.authService.refreshToken(dto)

    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    // console.log('in refreshToken');
    // return {
    //   accessToken: result.data?.accessToken!,
    //   refreshToken: result.data?.refreshToken!, // передаем refreshToken для интерсептора
    // };

    res.cookie('refreshToken', result.data?.refreshToken, {
      httpOnly: true,
      secure: true,
      // secure: SETTINGS.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data?.accessToken!,
    });
  }

  @Post('logout')
  @UseGuards(RefreshTokenAuthGuard)
  @UseInterceptors(ClearCookieInterceptor)
  @HttpCode(204)
  async logout(
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Result = await this.commandBus.execute<LogoutCommand, Result>(
      new LogoutCommand(deviceId, iat),
    );

    // const result: Result = await this.authService.logout(deviceId, iat);

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
}
