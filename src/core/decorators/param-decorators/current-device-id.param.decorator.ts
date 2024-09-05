import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentDeviceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.device?.deviceId)
      throw new Error('RefreshTokenAuthGuard must be used');
    return request.device.deviceId;
  },
);
