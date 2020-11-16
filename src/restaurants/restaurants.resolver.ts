import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

/* 
  Resolver 데코레이터에는 ReturnTypeFunction을 넣어도 안 넣어도 된다.(not mandatory)
  하지만 좀 더 잘 알아보기 위해 적었음
*/
@Resolver(of => Restaurant)
export class RestaurantResolver {
  //Query decorator는 ReturnTypeFunction을 받음. Function이 받고자 하는 type을 리턴해야함
  /*
   TypeScript에서는 배열 타입을 표시할때 Restaurant[] 로 표기하지만,
   GraphQL에서는 [Restaurant]로 표기함
  */
  @Query(returns => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    //@Args("이름") 변수명 : 이름으로 전달된 인자를 변수명에 할당함
    console.log(veganOnly);
    return [];
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
  createRestaurant(
    /*
      DTO에서 @InputType 데코레이터를 사용하여 하나의 객체로 파라미터를 받도록 설정했다면
      @Args 데코레이터에는 해당 객체의 이름을 나타나는 파라미터명이 입력되어야함.
      예) @Args('createRestaurantInput') ...

      하지만 DTO에서 @ArgsType 데코레이터를 이용하여 파라미터를 분리해서 받을 수 있도록 설정했다면,
      @Args 데코레이터에 아무런 이름을 지정하지 않아도 됨
    */
    @Args() createRestaurantInput: CreateRestaurantDto,
  ): boolean {
    return true;
  }
}
