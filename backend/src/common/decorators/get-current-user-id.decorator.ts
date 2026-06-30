import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
};

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string | undefined => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.id;
  },
);
