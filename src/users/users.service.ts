import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
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
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const exists = await this.users.findOne({ email }); // check new user

      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      // create user & hash the password
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne({ email });
      // 1. find the user with the email
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      // 2. check if the password is correct
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }

      // 3. make a JWT and givt it to the user
      return {
        ok: true,
        token: 'lalalala',
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
