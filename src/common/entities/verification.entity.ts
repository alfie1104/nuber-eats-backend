import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CoreEntity } from './core.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(type => String)
  code: string;

  /*
     we added @OneToOne to the profile and specify the target relation type to be Profile. 
     @JoinColumn : OneToOne 관계에서 한쪽 entity에만 설정. 이 데코레이터를 설정하는 쪽은 "relation id"를 포함하고 target entity table에 대한 foreign keys를 갖는 엔티이임
  */
  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
    //Math.random().toString(36).substring(2) 혹은 npm i uuid 패키지를 이용하여 랜덤한 문자열 생성 가능
  }
}
