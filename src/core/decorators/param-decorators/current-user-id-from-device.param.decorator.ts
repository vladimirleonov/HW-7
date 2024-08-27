import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserIdFromDevice = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.device?.userId)
      throw new Error('RefreshTokenGuard must be used');
    return request.device.userId;
  },
);
