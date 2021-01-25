import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' }); //graphql을 위해 enum 등록

@InputType('UserInputType', { isAbstract: true }) // 상속시 InputType으로 상속하기 위해
@ObjectType()
@Entity()
export class User extends CoreEntity {
  //중복된 email이 없도록 하기 위해 unique옵션을 설정한다
  @Column({ unique: true }) //for DB.
  @Field(type => String) //for graphql
  @IsEmail()
  email: string;

  @Column({ select: false }) //데이터를 가져올때 password는 가져오지 않도록 설정.
  @Field(type => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(type => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.owner,
  )
  restaurants: Restaurant[];

  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.customer,
  )
  orders: Order[];

  @Field(type => [Payment])
  @OneToMany(
    type => Payment,
    payment => payment.user,
    { eager: true },
  )
  payments: Payment[];

  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.driver,
  )
  rides: Order[];

  @BeforeInsert() //DB에 데이터를 Insert하기 전에 사용되는 TypeORM event Listner
  @BeforeUpdate() //DB에 데이터를 Update하기 전에 사용되는 TypeORM event Listner.
  //BeforeUpdate를 작동시키려면 Entity를 통해서 데이터를 변경해야함. Repository.update()메소드는 Entity를 거치지 않고 바로 DB에 query를 전달하므로 BeforeUpdate가 동작하지 않음
  async hashPassword(): Promise<void> {
    //DB에 데이터를 입력하기 전 비밀번호를 암호화함.
    //saltRounds는 10번 수행
    if (this.password) {
      /*
        사용자가 입력한 데이터에 password정보가 있을 경우에만 암호화 로직을 수행
        그렇지 않으면 매번 데이터를 입력(비밀번호를 변경하지 않을때에도) 할때마다 암호화가 수행되어서,
        암호화된 비밀번호를 다시 암호화하게 되는 문제 발생
        */
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
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
