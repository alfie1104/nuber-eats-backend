import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//Application을 시작시키는 부분
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //class-validation을 하기 위해 GlobalPipe를 사용
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  //app.use(JwtMiddleware);
  /* 
    미들웨어를 여기서 혹은 
    app.module 등과 같이 모듈 내부에서 Consumer를 이용하여 구현해도 된다.

    단, 여기서 사용하기 위해서는 미들웨어가 functional middleware이어야함. Class Middleware이면 안 된다.
  */
  await app.listen(4000);
}
bootstrap();
