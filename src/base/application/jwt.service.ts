import { Injectable } from '@nestjs/common';
import { appSettings } from '../../settings/app-settings';
import jwt, { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly secret = appSettings.api.JWT_SECRET;

  generateToken(payload: Object, expiresIn: string = '7d'): string {
    return jwt.sign(payload, appSettings.api.JWT_SECRET, { expiresIn });
  }
  verifyToken(token: string): string | JwtPayload {
    return jwt.verify(token, appSettings.api.JWT_SECRET);
  }
  decode(token: string): string | JwtPayload | null {
    return jwt.decode(token);
  }
}
