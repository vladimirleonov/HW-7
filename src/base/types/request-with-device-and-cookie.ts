export class RequestWithDeviceAndCookies extends Request {
  cookies: { [key: string]: string };
  device: {
    userId: string;
    deviceId: string;
    iat: string;
  };
}
