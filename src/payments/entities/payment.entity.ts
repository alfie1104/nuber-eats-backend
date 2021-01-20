import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true }) // 상속시 InputType으로 상속하기 위해
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(type => Int)
  @Column()
  transactionId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.payments,
  )
  user?: User;

  /*
  [@RelationId]
  전체 Relation정보(User Entity)를 갖는 owner와 별도로
   Relation id만 필요한 경우 사용하기 위해 @RelationId 데코레이터로
   새로운 속성을 설정한다.
  */
  @RelationId((payment: Payment) => payment.user)
  userId: number;

  //유저가 가진 여러 음식점중 홍보하려는 음식점
  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant)
  restaurant?: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
