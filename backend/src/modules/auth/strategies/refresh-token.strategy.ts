import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

type RequestWithCookies = Omit<Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

const cookieExtractor = (request: Request): string | null => {
  const { cookies } = request as RequestWithCookies;
  if (cookies) {
    return cookies.refreshToken ?? null;
  }
  return null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const secret = config.getOrThrow<string>('JWT_REFRESH_SECRET');
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: JwtPayload) {
    const { cookies } = request as RequestWithCookies;
    const refreshToken = cookies?.refreshToken;

    if (!payload.sub || !refreshToken) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken,
    };
  }
}
