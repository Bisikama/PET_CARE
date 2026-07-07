import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['refreshToken'] || null;
  }
  return null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    if (process.env.NODE_ENV === 'production' && !secret) {
      throw new Error('JWT_REFRESH_SECRET must be defined in production!');
    }
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: secret || 'refresh_secret_key_123',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies['refreshToken'];
    return {
      ...payload,
      refreshToken,
    };
  }
}
