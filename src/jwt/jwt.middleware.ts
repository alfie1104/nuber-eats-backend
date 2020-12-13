import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/users/users.service';
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
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //http를 이용하는 header에 접근하기 위해 미들웨어 구성
    //header에 있는 token정보 획득이 목적
    //"x-jwt"는 그냥 설정한 약속어임. Client와 토큰을 주고 받을때 이걸 기준으로 token정보 획득하도록 할 계획
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      if (token && token.length > 0) {
        try {
          const decoded = this.jwtService.verify(token.toString());

          if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
            const { user, ok } = await this.userService.findById(decoded['id']);
            //db에서 유저를 찾아서 request object에 추가한 뒤 next() 호출
            if (ok) {
              req['user'] = user;
            }
          }
        } catch (e) {}
      }
    }
    next();
  }
}
