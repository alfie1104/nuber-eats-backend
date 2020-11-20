import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

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
  email: string;

  @Column()
  @Field(type => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(type => UserRole)
  role: UserRole;
}
