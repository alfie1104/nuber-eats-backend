import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//Application을 시작시키는 부분
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
