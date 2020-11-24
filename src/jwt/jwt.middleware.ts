import { Injectable, NestMiddleware } from '@nestjs/common';
import { TransformationType } from 'class-transformer/enums';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

/*
// Injectable()을 사용하지 않는다면 Function으로 미들웨어를 만들어도 됨
export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers);
  next();
}
*/

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      if (token && token.length > 0) {
        const decoded = this.jwtService.verify(token.toString());

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          try {
            const user = await this.userService.findById(decoded['id']);
            req['user'] = user;
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
    next();
  }
}
