import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

enum UserRole {
  Owner,
  Client,
  Delivery,
}

registerEnumType(UserRole, { name: 'UserRole' }); //graphql을 위해 enum 등록

@InputType({ isAbstract: true }) // 상속시 InputType으로 상속하기 위해
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column() //for DB
  @Field(type => String) //for graphql
  @IsEmail()
  email: string;

  @Column()
  @Field(type => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert() //DB에 데이터를 Insert하기 전에 사용되는 TypeORM event Listner
  async hashPassword(): Promise<void> {
    //DB에 데이터를 입력하기 전 비밀번호를 암호화함.
    //saltRounds는 10번 수행
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
