import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';

@Injectable()
export class AuthService {
  constructor(private readonly appSettings: AppSettings) {}
  generatePasswordHash (password: string): Promise<string> {
    console.log('generating password hash!!!')
    return bcrypt.hash(password, this.appSettings.api.HASH_ROUNDS)
  }
}