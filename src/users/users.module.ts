import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from 'src/common/entities/verification.entity';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}
