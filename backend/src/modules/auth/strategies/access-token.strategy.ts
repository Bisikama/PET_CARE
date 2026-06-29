import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AUTH_ERRORS } from '../../../common/constants/error-messages.constant';


type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = config.getOrThrow<string>('JWT_ACCESS_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException(AUTH_ERRORS.ACCOUNT_LOCKED_OR_MISSING);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    }; // Attached to req.user
  }
}
