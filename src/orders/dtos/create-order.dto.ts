import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { OrderItemOption } from '../entities/order-item.entity';

@InputType()
class CreateOrderItemInput {
  @Field(type => Int)
  dishId: number;

  @Field(type => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

/* 
  만약 CreateOrderInput 클래스 생성 시, extends를 이용하여 PickType(Order, ["items"])로 생성한다면
  OrderItem에 있는 모든 항목들을 사용자에게 다 입력하라고 요구해야한다.
  그렇게 하지 않기위해서 별도로 CreateOrderItemInput을 만들고 dishId와 options만 입력하도록 설정하였다
*/
@InputType()
export class CreateOrderInput {
  @Field(type => Int)
  restaurantId: number;

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
