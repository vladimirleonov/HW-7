import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserIdFromDevice = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.device?.userId)
      throw new Error('User id not provided in device request');
    return request.device.userId;
  },
);
