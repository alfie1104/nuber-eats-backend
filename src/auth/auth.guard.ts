import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  /*
        Guard는 canActivate를 구현함
        CanActivate가 Context를 보고 true 혹은 false중에 한 가지를 return함

        그 결과에 따라 request를 막을지 통과시킬지가 결정됨(false일 경우 request가 차단됨)
    */
  canActivate(context: ExecutionContext) {
    //http 형태로 되어있는 context를 graphql로 변환
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];

    if (!user) {
      return false;
    } else {
      return true;
    }
  }
}
