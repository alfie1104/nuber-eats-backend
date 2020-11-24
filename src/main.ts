import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//Application을 시작시키는 부분
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //class-validation을 하기 위해 GlobalPipe를 사용
  app.useGlobalPipes(new ValidationPipe());
  //app.use(jwtMiddleware);
  /* 
    미들웨어를 여기서 혹은 
    app.module 등과 같이 모듈 내부에서 Consumer를 이용하여 구현해도 된다.
  */
  await app.listen(3000);
}
bootstrap();
