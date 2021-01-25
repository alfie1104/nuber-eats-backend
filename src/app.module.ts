import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import * as Joi from 'joi'; //TypeScript나 NestJS로 되어있지 않은 패키지를 import할때 이렇게해야함. 그냥 import Joi from "joi" 하면 Joi = undeifned가 됨. (joi라이브러리에서 Joi가 export 되어있지 않음)
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './common/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Category } from './restaurants/entities/category.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';

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


  - isGlobal : true로 설정하면 다른 모듈에서 ConfigModule 혹은 ConfigService 사용시 별도로 import를 안해도 사용가능.
*/
/*
  [Joi]
  환경변수 값 입력에 대해 유효성을 검사하기 위해 joi 패키지를 사용
*/
/*
  [Dynamic Module vs Static Module]
  - Dynamic Module : Static Method인 forRoot를 이용하여 설정정보를 전해주면 기능이 최종적으로 정해지는 것
    예) ConfigModule, TypeOrmModule....
  - Static Module : 항상 동일한 기능을 수행
    예) UsersModule, CommonModule
*/
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
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
      logging:
        process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true, //graphQL서버가 ws기능을 가지도록 설정(이걸 안하면 http기능만 가짐. subscription 수행 X)
      autoSchemaFile: true,
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt';
        //context를 이용하여 정보를 graphql resolver들과 공유

        /*
        http요청의 경우, req.headers에 있는 정보를 가져오고
        Websocket은 connection.context의 정보를 가져옴.(ws요청의 경우 request가 없음. connection에서 받아온 정보를 이용하여 user정보를 가져와야함)
        Websocket의 connection.context는 http의 req.headers와 유사한역할임
        */
        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
      },
    }),
    ScheduleModule.forRoot(),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    UsersModule,
    CommonModule,
    AuthModule,
    RestaurantsModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

//////Websocket에서도 인증을 처리할 수 있도록 jwtMiddleware사용 중지. jwtMiddleware는 req를 이용하기때문에 http에서만 사용가능
//Middleware를 사용하기 위해 NestModule을 Implements했음
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer): any {
//     //이 부분 말고 미들웨어를 main.ts파일의 bootstrap 함수내에서 구현해도 됨. app.use(미들웨어명)
//     /*
//       apply만 해도되지만,
//       forRoutes : forRoutes를 이용하여 어떤 경로에 middleware를 적용할지 지정할 수 있음
//       exclude : exclude를 이용하여 특정 경로만 제외 시킬 수 있음
//      */
//     /*
//     consumer.apply(jwtMiddleware).exclude({
//       path: '/admin',
//       method: RequestMethod.ALL,
//     });
//     */
//     consumer.apply(JwtMiddleware).forRoutes({
//       path: '/graphql',
//       method: RequestMethod.ALL,
//     });
//   }
// }
