import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  /*
        Guard는 function의 기능을 보충해주며, true 혹은 false 값을 리턴해야함

        Guard는 canActivate를 구현함
        CanActivate가 Context를 보고 true 혹은 false중에 한 가지를 return함

        그 결과에 따라 request를 막을지 통과시킬지가 결정됨(false일 경우 request가 차단됨)
    */
  canActivate(context: ExecutionContext) {
    //role.decorator에서 SetMetadata('roles',..) 로 설정한 metadata를 가져옴
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      /*
      role이 없으면 Metadata를 설정하지 않은 pulbic api를 뜻함
      context에 user 정보를 설정하는 작업을 하지 않고 그냥 진행시킴
      */
      return true;
    }

    /*
      roles가 있다면, private API를 의미하므로,
      user정보가 존재해야하며 (없을 경우 false return)
      user의 role정보가 roles에서 허용하는 role과 일치해야함
    */

    //http 형태로 되어있는 nestjs의 ExecutionContext를 graphqlExecutionContext로 변환
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];

    if (!user) {
      return false;
    }

    if (roles.includes('Any')) {
      return true;
    }

    /*
    API에서 @Role(['Any','Owner'...])등으로 설정한 정보(SetMetadata를 이용하여 설정)가 roles에 담기게 됨(reflector를 통해서)
    따라서 roles.includes를 통해 user.role이 roles에 포함되어있는지 확인함으로써
    해당 API에 접근가능한 사용자인지 아닌지를 판별 할 수 있음
    */
    return roles.includes(user.role);
  }
}
