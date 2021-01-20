import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  PUB_SUB,
  NEW_ORDER_UPDATE,
} from 'src/common/common.constants';
import {
  TakeOrderInput,
  TakeOrderOutput,
} from 'src/restaurants/dtos/take-order.dto';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(returns => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(user, getOrdersInput);
  }

  @Query(returns => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(user, getOrderInput);
  }

  @Mutation(returns => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(user, editOrderInput);
  }

  @Mutation(returns => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    /*
    pubsub.publish 를 이용하여 특정 trigger(subscription의 첫번째 인자)에
    payload(subscription의 두번째 인자)전송.
    payload의 key는 @Subscription decorator가 설정된 함수명을 사용해야함
    */
    await this.pubsub.publish('hotPotatos', {
      orderSubscription: potatoId,
    });
    return true;
  }

  @Subscription(returns => String, {
    filter: (payload, variables, context) => {
      //특정한 조건을 만족할때에만 subscription을 수신하도록 하기 위해 filter적용
      return payload.orderSubscription === variables.potatoId;
    },
    resolve: (payload, args, context, info) => {
      /*
      사용자가 받는 update 알림의 형태를 바꿔주기 위해 resolve 구현
      resolve에서 반환한 값을 사용자가 수신하게 됨
      */
      return `Your potato with the id ${payload.orderSubscription} is ready.`;
    },
  })
  @Role(['Any'])
  orderSubscription(
    @AuthUser() user: User,
    @Args('potatoId') potatoId: number,
  ) {
    return this.pubsub.asyncIterator('hotPotatos');
  }

  @Subscription(returns => Order, {
    filter: (payload, variables, context) => {
      //특정한 조건을 만족할때에만 subscription을 수신하도록 하기 위해 filter적용
      //filter는 true 혹은 false를 return해야함

      return payload.pendingOrders.ownerId === context.user.id;
    },
    resolve: (payload, args, context, info) => {
      /*
      사용자가 받는 update 알림의 형태를 바꿔주기 위해 resolve 구현
      resolve에서 반환한 값을 사용자가 수신하게 됨
      */
      return payload.pendingOrders.order;
    },
  })
  @Role(['Owner'])
  pendingOrders() {
    //NEW_PENDING_ORDER (String)의 asynIterator를 return
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(returns => Order, {
    filter: (payload, _, context) => {
      return true;
    },
    resolve: (payload, args, context, info) => {
      return payload.cookedOrders.order;
    },
  })
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(returns => Order, {
    filter: (
      { orderUpdates: order }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }

  @Mutation(returns => TakeOrderOutput)
  @Role(['Delivery'])
  takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.orderService.takeOrder(driver, takeOrderInput);
  }
}
