import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Result, ResultStatus } from '../../../base/types/object-result';
import { UtilsService } from '../../application/utils.service';
import { Request } from 'express';
import { SecurityService } from '../../../features/auth/security/application/security.service';
import { TooManyRequestsException } from '../../exception-filters/http-exception-filter';

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
      throw new TooManyRequestsException('Rate limit exceeded');
    }

    return true;
  }
}
