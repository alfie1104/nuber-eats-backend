import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/*
  데코레이터를 만들기 위해 createParamDecorator 함수 사용.
  createParamDecorator는 Factory Function을 인자로 받으며,
  Factory Function에는 항상 unknown value인 data와 context가 있음
  
  본 데코레이터가 return 하는 값을 데코레이터를 사용하는 곳에서 이용할 수 있음
*/
export const AuthUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    //http 형태로 되어있는 nestjs의 ExecutionContext를 graphqlExecutionContext로 변환
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];

    return user;
  },
);
