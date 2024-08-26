import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginModel } from './models/input/login.input.model';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { UtilsService } from '../../../base/application/utils.service';
import { AuthService } from '../application/auth.service';
import { Response } from 'express';
import { LoginDto } from '../application/dto/login.dto';
import { RegistrationModel } from './models/input/registration.input.model';
import { RefreshTokenGuard } from '../../../infrastructure/guards/refresh-token.guard';
import { ConfirmRegistrationModel } from './models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from './models/input/registration-email-resending.model';
import { AuthMeOutputModel } from './models/output/auth-me.output';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { AuthGuard } from '../../../infrastructure/guards/auth.guard';
import { PasswordRecoveryModel } from './models/input/password-recovery.model';
import { NewPasswordModel } from './models/input/new-password.model';
import { RateLimitGuard } from '../../../infrastructure/guards/rate-limit.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/param-decorators/current-user-id.param.decorator';
import { CurrentDeviceId } from '../../../infrastructure/decorators/param-decorators/current-device-id.param.decorator';
import { CurrentDeviceIat } from '../../../infrastructure/decorators/param-decorators/current-device-iat.param.decorator';
import { RequestWithCookies } from '../../../base/types/request-with-cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('/registration')
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: result.extensions,
        },
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: result.extensions,
        },
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: result.extensions,
        },
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: result.extensions,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(
    @Req() req: RequestWithCookies,
    @Body() loginModel: LoginModel,
    @Res() res: Response,
  ) {
    const ip: string = this.utilsService.getIpAddress(req);
    const deviceName: string = this.utilsService.getDeviceName(req);

    // TODO: use decorator or no?
    const refreshToken: string = req.cookies?.refreshToken;

    const { loginOrEmail, password } = loginModel;

    const dto: LoginDto = new LoginDto(
      loginOrEmail,
      password,
      ip,
      deviceName,
      refreshToken,
    );

    const result = await this.authService.login(dto);
    if (result.status === ResultStatus.Unauthorized) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: result.extensions,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    res.cookie('refreshToken', result.data?.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true, // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data?.accessToken,
    });
  }

  @Post('me')
  @UseGuards(AuthGuard)
  async authMe(@CurrentUserId() userId: string, @Res() res: Response) {
    const user: AuthMeOutputModel | null =
      await this.usersQueryRepository.findAuthenticatedUserById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    res.status(HttpStatus.OK).send(user);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
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

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
