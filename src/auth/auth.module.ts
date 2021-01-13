import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

/*
    [APP_GUARD] nestjs에서 제공된 constant
    guard를 '앱 모든 곳에서 사용'하고 싶으면 그냥 APP_GUARD를 provide하면 됨
*/
@Module({
  imports: [UsersModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
