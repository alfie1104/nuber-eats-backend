import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './common.constants';

/*
 PubSub은 전체 어플리케이션에서 단 하나만 생성가능.
 모든 resolver에서 동일한 PubSub을 사용하기 위해서 Global() 데코레이터를 적용한
 CommonModule에 pubsub을 등록한 뒤, exports 시켰음

 사용은 어떻게?
 사용하려는 resolver의 constructor에 인자로
 @Inject(토큰) private readonly pubSub : PubSub 를 작성

 여기서 토큰부분은 Provide시킬때 사용한 문자열임 (예 : PUB_SUB)
*/
const pubsub = new PubSub();

@Global()
@Module({
  providers: [{ provide: PUB_SUB, useValue: pubsub }],
  exports: [PUB_SUB],
})
export class CommonModule {}
