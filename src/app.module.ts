import { Module } from '@nestjs/common';
import * as Joi from 'joi'; //TypeScript나 NestJS로 되어있지 않은 패키지를 import할때 이렇게해야함. 그냥 import Joi from "joi" 하면 Joi = undeifned가 됨. (joi라이브러리에서 Joi가 export 되어있지 않음)
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';

//main.ts로 import되는 유일한 모듈
//따라서 graphQL모듈도 AppModule에 추가해야함
/* 
  [GraphQLModule]
  GraphQLMoudle.forRoot() : root module을 설정하는 것
  forRoot에는 두가지 방법이 있음
   - Code First :  데코레이터와 타입스크립트 클래스를 이용해서 코드를 작성하면 그에 맞는 GraphQLSchema를 자동적으로 생성해줌
        Code First방식에서 autoSchemaFile 옵션을true로 설정하면 별도의 schema파일을 생성하지 않고 메모리에서만 schema를 인식하고 있도록 설정가능
        autoSchemaFile옵션에 경로+파일명을 적으면 해당 경로에 지정한 이름의 schema파일이 생성됨
   - Schema First : GraphQLModule에게 schema가 기록된 파일 제공
*/
/*
  [TypeOrmModule]
  TypeOrmModuleOptions : {
    synchronize : TypeORM이 데이터베이스에 연결할때 데이터베이스를 javascript 모듈의 현재 상태로 업데이트 할지 여부(TypeORM이 DB를 자동으로 Migration함)
                (수동으로 DB를 -스키마- Update하고 싶으면 synchronize : false로 설정하면 됨)
  }
*/
/*
  [ConfigModule]
  Development, Test, Production 각각에 따라 다른 환경변수를 사용하기 위해 
  .env파일의 정보를 읽을 수 있는 @nestjs/config의 ConfigModule을 import했음
  @nestjs/config는 내부적으로 dotenv 패키지를 사용하고 있음

  ConfigModule은 환경변수 파일(.env)를 NODE_ENV값에 따라 다르게 읽어들이는데, 
  NODE_ENV값은 프로그램 실행시점에 cross-env 스크립트를 이용하여 전달가능.
  예)cross-env NODE_ENV=dev nest start --watch
  
  여기서 cross-env를 사용하기 위해 cross-env 패키지를 설치해야함
*/
/*
  [Joi]
  환경변수 값 입력에 대해 유효성을 검사하기 위해 joi 패키지를 사용
*/
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT, //String 형태로 전달되는 환경변수를 숫자로 변경하기 위해 +를 붙였음
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV !== 'prod',
      entities: [Restaurant],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
