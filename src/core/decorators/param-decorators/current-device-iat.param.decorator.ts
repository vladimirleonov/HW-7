import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentDeviceIat = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.device?.iat) throw new Error('RefreshTokenGuard must be used');
    return request.device.iat;
  },
);
