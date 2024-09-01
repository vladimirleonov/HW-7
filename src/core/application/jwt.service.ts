import { Injectable } from '@nestjs/common';
import { appSettings } from '../../settings/app-settings';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  private readonly secret: string = appSettings.api.JWT_SECRET;

  generateToken(payload: object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, appSettings.api.JWT_SECRET, { expiresIn });
  }

  verifyToken(token: string): string | JwtPayload {
    return jwt.verify(token, appSettings.api.JWT_SECRET);
  }

  decode(token: string): string | JwtPayload | null {
    return jwt.decode(token);
  }
}
