import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppSettings } from '../../settings/app-settings';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly appSettings: AppSettings) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const auth: string | undefined = request.headers['authorization'];
    if (!auth || !auth.startsWith('Basic ')) {
      throw new UnauthorizedException();
    }

    const bytes: Buffer = Buffer.from(auth.slice(6), 'base64'); //<Buffer 61 64 6d 69 6e 3a 71 77 65 72 74 79>
    const decodedData: string = bytes.toString('utf8'); //admin:qwerty

    const CREDENTIALS: string = `${this.appSettings.api.ADMIN_LOGIN}:${this.appSettings.api.ADMIN_PASSWORD}`;

    if (decodedData !== CREDENTIALS) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
