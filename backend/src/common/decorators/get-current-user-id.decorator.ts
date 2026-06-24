import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

type RequestWithUser = Request & { user?: { sub?: string } };

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.sub;
  },
);
