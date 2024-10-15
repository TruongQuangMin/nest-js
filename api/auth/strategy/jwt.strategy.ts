import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Lấy JWT từ Bearer Token trong Header
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),  // Lấy secret từ biến môi trường
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };  // Trả về payload cho request
  }
}
