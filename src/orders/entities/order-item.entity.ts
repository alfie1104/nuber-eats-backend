import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(type => String)
  name: string;

  @Field(type => String, { nullable: true })
  choice?: string;

  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  /*
    ManyToOne 관계 설정 시, 반대쪽 Entity(Inverse side)에서 현재 Entity에 접근할 필요가 없다면,
    dish => dish.xxxx 와 같이 inverse side에서 접근하는 방법을 명시하지 않아도 된다.
  */
  @ManyToOne(type => Dish, { nullable: true, onDelete: 'CASCADE' })
  @Field(type => Dish, { nullable: true })
  dish: Dish;

  /*
    type:"json"을 이용해서 데이터를 json형태로 저장할 수 있다.
    여러정보를 하나의 칼럼에 저장하기 위해서는 별도의 entity를 만들고 relation을 생성하거나,
    지금처럼 json 형태로 저장하거나 둘 중 하나를 필요에 맞게 사용하면 된다.

    json 데이터 타입은 MySQL, PostgreSQL에서 지원됨
  */
  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
