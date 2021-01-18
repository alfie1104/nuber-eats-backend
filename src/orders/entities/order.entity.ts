import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Cooked = 'Cooked',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' }); //graphql을 위해 enum 등록

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.orders,
    { onDelete: 'SET NULL', nullable: true, eager: true },
  )
  customer?: User;

  /*
  [@RelationId]
  전체 Relation정보(User Entity)를 갖는 owner와 별도로
   Relation id만 필요한 경우 사용하기 위해 @RelationId 데코레이터로
   새로운 속성을 설정한다.
  */
  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    { onDelete: 'SET NULL', nullable: true, eager: true },
  )
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.orders,
    { onDelete: 'SET NULL', nullable: true, eager: true },
  )
  restaurant?: Restaurant;

  /*
    [JoinTable] ManyToMany 관계에서는 JoinTable을 지정해줘야하는데
    소유(owning)하고 있는 쪽의 relation에 추가하면 된다.

    Dish와 Order의 관계에서, Order는 어떤 고객이 어떤 Dish를 주문했는지 알 수 있으므로
    JoinTable을 Order에 설정한다.
  */
  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[];

  @Field(type => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(type => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
