import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/*
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(req.headers);
    next();
  }
}
*/

// Inject등을 사용하지 않는다면 Function으로 미들웨어를 만들어도 됨
export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers);
  next();
}
