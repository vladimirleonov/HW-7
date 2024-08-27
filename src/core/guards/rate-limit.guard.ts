import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Result, ResultStatus } from '../../base/types/object-result';
import { UtilsService } from '../application/utils.service';
import { Request } from 'express';
import { SecurityService } from '../../features/security/application/security.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest<Request>();

    const ip: string = this.utilsService.getIpAddress(req);
    const originUrl: string = req.originalUrl;

    const result: Result = await this.securityService.checkRateLimit(
      ip,
      originUrl,
    );
    if (result.status === ResultStatus.TooManyRequests) {
      throw new HttpException(
        {
          status: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
