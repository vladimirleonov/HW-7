import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { LoginModel } from './models/input/login.input.model';
import { Result, ResultStatus } from '../../../../base/types/object-result';
import { UtilsService } from '../../../../base/application/utils.service';
import { AuthService } from '../application/auth.service';
import { Request, Response } from 'express';

export interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly utilsService: UtilsService,
  ) {}
  @Post()
  async login(
    @Req() req: RequestWithCookies,
    @Body() loginModel: LoginModel,
    @Res() res: Response,
  ) {
    const ip: string = this.utilsService.getIpAddress(req);
    const deviceName: string = this.utilsService.getDeviceName(req);

    const refreshToken: string = req.cookies?.refreshToken;

    const { loginOrEmail, password } = loginModel;

    const dto = {
      loginOrEmail,
      password,
      ip,
      deviceName,
      refreshToken,
    };

    const result = await this.authService.login(dto);
    if (result.status === ResultStatus.BadRequest) {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: result.extensions![0].message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = result.data?.accessToken;

    res.cookie('refreshToken', result.data?.refreshToken, {
      httpOnly: true, // cookie can only be accessed via http or https
      secure: true,
      //secure: process.env.NODE_ENV === 'production', // send cookie only over https
      sameSite: 'strict', // protects against CSRF attacks
    });

    return accessToken;
  }
}
