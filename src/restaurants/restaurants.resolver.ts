import {
  Args,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  /*
    RestaurantService를 사용하기 위해서 restaurants.module에서 RestaurantService를 Provider에 공급 하였음
    @Injectable인 RestaurantService를 module에서 Provider에 공급하면,
    Resolver에서 별도로 객체를 생성하지 않아도 사용 가능(by Injecting)
  */
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(returns => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    /*
        DTO에서 @InputType 데코레이터를 사용하여 하나의 객체로 파라미터를 받도록 설정했다면
        @Args 데코레이터에는 해당 객체의 이름을 나타나는 파라미터명이 입력되어야함.
        예) @Args('createRestaurantInput') ...

        하지만 DTO에서 @ArgsType 데코레이터를 이용하여 파라미터를 분리해서 받을 수 있도록 설정했다면,
        @Args 데코레이터에 아무런 이름을 지정하지 않아도 됨
      */
    @AuthUser() authUser: User,
    @Args('input') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(
      authUser,
      createRestaurantInput,
    );
  }

  @Query(returns => MyRestaurantsOutput)
  @Role(['Owner'])
  myRestaurants(@AuthUser() owner: User): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(owner);
  }

  @Query(returns => MyRestaurantOutput)
  @Role(['Owner'])
  myRestaurant(
    @AuthUser() owner: User,
    @Args('input') myRestaurantInput: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantService.myRestaurant(owner, myRestaurantInput);
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(['Owner'])
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(returns => DeleteRestaurantOutput)
  @Role(['Owner'])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(
      owner,
      deleteRestaurantInput,
    );
  }

  @Query(returns => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(
    @Args('input') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurant(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  /*
    @ResolveField() : 매 Request마다 계산된 field를 생성해줌
    DB에 없지만 request를 받는 시점에 계산하여
    마치 DB의 한 필드(예: Category Entity의 Field)인 것 처럼 제공해줌

    [사용 예]
    query{
      allCategories{
        ok
        error
        categories {
          id
          name
          slug
          restaurantCount
        }
      }
    }
  */
  @ResolveField(type => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    /*
    Promise를 return하면 브라우저가 알아서 결과가 나올때 까지 기다리므로,
    await를 쓸 필요 없음
    */
    return this.restaurantService.countRestaurants(category);
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(type => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(type => EditDishOutput)
  @Role(['Owner'])
  editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(type => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}

// /*
//   Resolver 데코레이터에는 ReturnTypeFunction을 넣어도 안 넣어도 된다.(not mandatory)
//   하지만 좀 더 잘 알아보기 위해 적었음
// */
// @Resolver(of => Restaurant)
// export class RestaurantResolver {
//   /*
//     RestaurantService를 사용하기 위해서 restaurants.module에서 RestaurantService를 Provider에 공급 하였음
//     @Injectable인 RestaurantService를 module에서 Provider에 공급하면,
//     Resolver에서 별도로 객체를 생성하지 않아도 사용 가능(by Injecting)
//   */
//   constructor(private readonly restaurantService: RestaurantService) {}
//   //Query decorator는 ReturnTypeFunction을 받음. Function이 받고자 하는 type을 리턴해야함
//   /*
//    TypeScript에서는 배열 타입을 표시할때 Restaurant[] 로 표기하지만,
//    GraphQL에서는 [Restaurant]로 표기함
//   */
//   @Query(returns => [Restaurant])
//   restaurants(): Promise<Restaurant[]> {
//     //@Args("이름") 변수명 : 이름으로 전달된 인자를 변수명에 할당함
//     return this.restaurantService.getAll();
//   }

//   /*
//   @Mutation(returns => Boolean)
//   createRestaurant(
//     @Args('name') name: string,
//     @Args('isVegan') isVegan: boolean,
//     @Args('address') address: string,
//     @Args('ownersName') ownersName: string,
//   ): boolean {
//     return true;
//   }
//   이렇게 해도 되지만, 별도로 dto를 만들고 한번에 모든 파라미터를 넘길 수도 있다.
//   */
//   @Mutation(returns => Boolean)
//   async createRestaurant(
//     /*
//       DTO에서 @InputType 데코레이터를 사용하여 하나의 객체로 파라미터를 받도록 설정했다면
//       @Args 데코레이터에는 해당 객체의 이름을 나타나는 파라미터명이 입력되어야함.
//       예) @Args('createRestaurantInput') ...

//       하지만 DTO에서 @ArgsType 데코레이터를 이용하여 파라미터를 분리해서 받을 수 있도록 설정했다면,
//       @Args 데코레이터에 아무런 이름을 지정하지 않아도 됨
//     */
//     @Args('input') createRestaurantDto: CreateRestaurantDto,
//   ): Promise<boolean> {
//     try {
//       await this.restaurantService.createRestaurant(createRestaurantDto);
//       return true;
//     } catch (e) {
//       console.log(e);
//       return false;
//     }
//   }

//   @Mutation(returns => Boolean)
//   async updateRestaurant(
//     @Args('input') updateRestaurantDto: UpdateRestaurantDto,
//   ): Promise<boolean> {
//     try {
//       await this.restaurantService.updateRestaurant(updateRestaurantDto);
//       return true;
//     } catch (e) {
//       console.log(e);
//       return false;
//     }
//   }
// }
