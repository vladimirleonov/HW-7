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
import { Request, Response } from 'express';
import { LoginDto } from '../application/dto/login.dto';
import { RegistrationModel } from './models/input/registration.input.model';
import { RefreshTokenGuard } from '../../../infrastructure/guards/refresh-token.guard';
import { ConfirmRegistrationModel } from './models/input/confirm-registration.model';
import { RegistrationEmailResendingModel } from './models/input/registration-email-resending.model';
import { AuthMeOutputModel } from './models/output/auth-me.output';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { AuthGuard } from '../../../infrastructure/guards/auth.guard';

export interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

export interface RequestWithDeviceAndCookies extends Request {
  cookies: { [key: string]: string };
  device: {
    userId: string;
    deviceId: string;
    //?
    iat: string;
  };
}

export interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() registrationModel: RegistrationModel) {
    const { login, password, email } = registrationModel;

    const result: Result<string | null> = await this.authService.registration(
      login,
      password,
      email,
    );
    console.log(result);
    if (result.status === ResultStatus.BadRequest) {
      return result.extensions;
    }
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmRegistration(
    @Body() confirmRegistrationModel: ConfirmRegistrationModel,
  ) {
    const { code } = confirmRegistrationModel;

    console.log('code', code);
    const result: Result<boolean | null> =
      await this.authService.confirmRegistration(code);
    console.log(result);
    if (result.status === ResultStatus.BadRequest) {
      new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: result.extensions![0].message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('registration-email-resending')
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

  @Post('login')
  async login(
    @Req() req: RequestWithCookies,
    @Body() loginModel: LoginModel,
    @Res() res: Response,
  ) {
    const ip: string = this.utilsService.getIpAddress(req);
    const deviceName: string = this.utilsService.getDeviceName(req);

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
    console.log(result);
    if (result.status === ResultStatus.BadRequest) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: result.extensions![0].message,
        },
        // TODO:: may be Bad Request
        HttpStatus.UNAUTHORIZED,
      );
    }

    res.cookie('refreshToken', result.data?.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true,
      //secure: process.env.NODE_ENV === 'production', // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    res.status(HttpStatus.OK).send({
      accessToken: result.data?.accessToken,
    });
  }

  @Post('me')
  @UseGuards(AuthGuard)
  async authMe(@Req() req: RequestWithUser, @Res() res: Response) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException();
    }

    const user: AuthMeOutputModel | null =
      await this.usersQueryRepository.findAuthenticatedUserById(
        req.user.userId,
      );
    if (!user) {
      throw new UnauthorizedException();
    }

    res.status(HttpStatus.OK).send(user);
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@Req() req: RequestWithDeviceAndCookies, @Res() res: Response) {
    const deviceId: string | undefined = req.device?.deviceId;
    const iat: string | undefined = req.device?.iat;
    if (!deviceId || !iat) {
      throw new UnauthorizedException();
    }

    const result: Result = await this.authService.logout(deviceId, iat);
    if (result.status === ResultStatus.Unauthorized) {
      // console.error('Invalid or expired refresh token', result.extensions);
      throw new UnauthorizedException();
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      //secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
