import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.userService.findByCond({
      id: payload.sub,
      email: payload.email,
    });
    if (!user) {
      throw new UnauthorizedException('Нет доступа к этой странице!');
    }
    return { id: payload.sub, email: payload.email };
  }
}
