import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  /*
    생성자에서 User Entity의 Repository인 users를 주입받음

    @InjectRepository(Entity) : module에서 import한 Entity를 본 Service에서 사용가능하도록 설정
  */
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    try {
      const exists = await this.users.findOne({ email }); // check new user

      if (exists) {
        return 'There is a user with that email already';
      }
      // create user & hash the password
      await this.users.save(this.users.create({ email, password, role }));
    } catch (e) {
      return "Couldn't create account";
    }
  }
}
