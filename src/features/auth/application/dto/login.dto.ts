export class LoginDto {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
    public readonly ip: string,
    public readonly deviceName: string,
    public readonly refreshToken: string,
  ) {}
}
