import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { AuthService } from '../application/auth.service';
import { Response } from 'express';
import { LoginDto } from '../application/dto/login.dto';
import { RegistrationModel } from './models/input/registration.input.model';
import { ConfirmRegistrationModel } from './models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from './models/input/registration-email-resending.model';
import { AuthMeOutputModel } from './models/output/auth-me.output';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { PasswordRecoveryModel } from './models/input/password-recovery.model';
import { NewPasswordModel } from './models/input/new-password.model';
import { RateLimitGuard } from '../../../core/guards/custom/rate-limit.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.param.decorator';
import { RefreshTokenGuard } from '../../../core/guards/custom/refresh-token.guard';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.param.decorator';
import { CurrentDeviceIat } from '../../../core/decorators/param-decorators/current-device-iat.param.decorator';
import { UtilsService } from '../../../core/application/utils.service';
import {
  BadRequestException,
  UnauthorizedException,
} from '../../../core/exception-filters/http-exception-filter';
// import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { RequestWithCookies } from '../../../base/types/request-with-cookie';
import { LocalAuthGuard } from '../../../core/guards/passport/local-auth.guard';
import { JwtAuthGuard } from '../../../core/guards/passport/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('registration')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async registration(@Body() registrationModel: RegistrationModel) {
    const { login, password, email } = registrationModel;

    const result: Result<string | null> = await this.authService.registration(
      login,
      password,
      email,
    );

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

    const result: Result<boolean | null> =
      await this.authService.confirmRegistration(code);
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

    const result: Result =
      await this.authService.registrationEmailResending(email);

    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
    }
  }

  @Post('password-recovery')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() passwordRecoveryModel: PasswordRecoveryModel) {
    const { email } = passwordRecoveryModel;

    await this.authService.passwordRecovery(email);

    // to prevent user's email detection send NO_CONTENT
    // for user by email not found or email send successfully
  }

  @Post('new-password')
  @UseGuards(RateLimitGuard)
  @HttpCode(204)
  async newPassword(@Body() newPasswordModel: NewPasswordModel) {
    const { newPassword, recoveryCode } = newPasswordModel;

    const result: Result = await this.authService.setNewPassword(
      newPassword,
      recoveryCode,
    );
    if (result.status === ResultStatus.BadRequest) {
      throw new BadRequestException(result.errorMessage!);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: RequestWithCookies,
    @CurrentUserId() userId: string,
    @Res() res: Response,
  ) {
    const ip: string = this.utilsService.getIpAddress(req);
    const deviceName: string = this.utilsService.getDeviceName(req);

    // TODO: use decorator or no?
    const refreshToken: string = req.cookies?.refreshToken;

    const dto: LoginDto = new LoginDto(userId, ip, deviceName, refreshToken);

    const loginResult = await this.authService.login(dto);
    if (loginResult.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException(loginResult.errorMessage!);
    }

    res.cookie('refreshToken', loginResult.data?.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    res.status(HttpStatus.OK).send({
      accessToken: loginResult.data?.accessToken,
    });
  }

  @Post('me')
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

  @Post('logout')
  @HttpCode(204)
  async logout(
    @CurrentDeviceId() deviceId: string,
    @CurrentDeviceIat() iat: string,
    @Res() res: Response,
  ) {
    const result: Result = await this.authService.logout(deviceId, iat);
    if (result.status === ResultStatus.Unauthorized) {
      throw new UnauthorizedException();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    // res.status(HttpStatus.NO_CONTENT).send();
  }
}
