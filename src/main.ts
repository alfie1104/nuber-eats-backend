import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//Application을 시작시키는 부분
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //class-validation을 하기 위해 GlobalPipe를 사용
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
