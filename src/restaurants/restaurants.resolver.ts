import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

/* 
  Resolver 데코레이터에는 ReturnTypeFunction을 넣어도 안 넣어도 된다.(not mandatory)
  하지만 좀 더 잘 알아보기 위해 적었음
*/
@Resolver(of => Restaurant)
export class RestaurantResolver {
  /*
    RestaurantService를 사용하기 위해서 restaurants.module에서 RestaurantService를 Provider에 공급 하였음
    @Injectable인 RestaurantService를 module에서 Provider에 공급하면,
    Resolver에서 별도로 객체를 생성하지 않아도 사용 가능(by Injecting)
  */
  constructor(private readonly restaurantService: RestaurantService) {}
  //Query decorator는 ReturnTypeFunction을 받음. Function이 받고자 하는 type을 리턴해야함
  /*
   TypeScript에서는 배열 타입을 표시할때 Restaurant[] 로 표기하지만,
   GraphQL에서는 [Restaurant]로 표기함
  */
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    //@Args("이름") 변수명 : 이름으로 전달된 인자를 변수명에 할당함
    return this.restaurantService.getAll();
  }

  /*
  @Mutation(returns => Boolean)
  createRestaurant(
    @Args('name') name: string,
    @Args('isVegan') isVegan: boolean,
    @Args('address') address: string,
    @Args('ownersName') ownersName: string,
  ): boolean {
    return true;
  }
  이렇게 해도 되지만, 별도로 dto를 만들고 한번에 모든 파라미터를 넘길 수도 있다.
  */
  @Mutation(returns => Boolean)
  async createRestaurant(
    /*
      DTO에서 @InputType 데코레이터를 사용하여 하나의 객체로 파라미터를 받도록 설정했다면
      @Args 데코레이터에는 해당 객체의 이름을 나타나는 파라미터명이 입력되어야함.
      예) @Args('createRestaurantInput') ...

      하지만 DTO에서 @ArgsType 데코레이터를 이용하여 파라미터를 분리해서 받을 수 있도록 설정했다면,
      @Args 데코레이터에 아무런 이름을 지정하지 않아도 됨
    */
    @Args('input') createRestaurantDto: CreateRestaurantDto,
  ): Promise<Boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    @Args('input') updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Boolean> {
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
