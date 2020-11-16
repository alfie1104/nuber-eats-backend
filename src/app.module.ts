import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';

//main.ts로 import되는 유일한 모듈
//따라서 graphQL모듈도 AppModule에 추가해야함
/* 
  GraphQLMoudle.forRoot() : root module을 설정하는 것
  forRoot에는 두가지 방법이 있음
   - Code First :  데코레이터와 타입스크립트 클래스를 이용해서 코드를 작성하면 그에 맞는 GraphQLSchema를 자동적으로 생성해줌
        Code First방식에서 autoSchemaFile 옵션을true로 설정하면 별도의 schema파일을 생성하지 않고 메모리에서만 schema를 인식하고 있도록 설정가능
        autoSchemaFile옵션에 경로+파일명을 적으면 해당 경로에 지정한 이름의 schema파일이 생성됨
   - Schema First : GraphQLModule에게 schema가 기록된 파일 제공
*/
@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
