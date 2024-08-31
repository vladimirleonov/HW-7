export class LoginDto {
  constructor(
    public readonly userId: string,
    // public readonly loginOrEmail: string,
    // public readonly password: string,
    public readonly ip: string,
    public readonly deviceName: string,
    public readonly refreshToken: string,
  ) {}
}
