import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { OrderItem } from './order-item.entity';

enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
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
    { onDelete: 'SET NULL', nullable: true },
  )
  customer?: User;

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    { onDelete: 'SET NULL', nullable: true },
  )
  driver?: User;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.orders,
    { onDelete: 'SET NULL', nullable: true },
  )
  restaurant?: Restaurant;

  /*
    [JoinTable] ManyToMany 관계에서는 JoinTable을 지정해줘야하는데
    소유(owning)하고 있는 쪽의 relation에 추가하면 된다.

    Dish와 Order의 관계에서, Order는 어떤 고객이 어떤 Dish를 주문했는지 알 수 있으므로
    JoinTable을 Order에 설정한다.
  */
  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem)
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