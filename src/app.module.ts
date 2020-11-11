import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

//main.ts로 import되는 유일한 모듈
//따라서 graphQL모듈도 AppModule에 추가해야함
//GraphQLMoudle.forRoot() : root module을 설정하는 것
@Module({
  imports: [GraphQLModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
