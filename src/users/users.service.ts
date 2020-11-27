import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from 'src/common/entities/verification.entity';

@Injectable()
export class UserService {
  /*
    생성자에서 User Entity의 Repository인 users를 주입받음

    @InjectRepository(Entity) : module에서 import한 Entity를 본 Service에서 사용가능하도록 설정
  */
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
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
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(this.verifications.create({ user }));

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
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      ); /*
        select 옵션을 주지 않으면, password칼럼은 가져오지 않음(Entity에 select false로 설정했기 때문)
        그러면 나중에 checkPassword에서 password와 this.password를 비교 시, this.password정보가 null이라서 오류가 발생함
      */
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

      // 3. make a JWT and give it to the user
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(userId: number, { email, password }: EditProfileInput) {
    /*
      Repository.update()는 entity를 직접 update하지 않음. 그저 DB에 쿼리를 보내기만 함
      따라서 update()메소드는 DB에 Entity가 실제로 있는지 체크하지 않으며,
      Update시점에 Entity에 설정된 @BeforeUpdate 데코레이터도 동작하지 않음 (Entity를 건드리지 않으므로)
    */
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }

    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        {
          relations: ['user'],
        },
      );
      /*
        findOne의 옵션으로 loadRelationIds, relations를 사용가능
        - loadRelationIds : true  : Relation을 설정한 칼럼의 값을 가져옴(relation 대상 테이블의 id값)
        - relations : 테이블을 설정함으로써 relation되어있는 테이블 값 전체를 가져옴
      */

      if (verification) {
        verification.user.verified = true;
        this.users.save(verification.user);
        return true;
      }

      throw new Error();
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
