import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

type UserRole = 'client' | 'owner' | 'delivery';

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

  @Column()
  @Field(type => String)
  role: UserRole;
}
