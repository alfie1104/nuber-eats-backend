import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Like, Raw, Repository } from 'typeorm';
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
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  /*
    생성자에서 Restaurant Entity의 Repository인 restaurants를 주입받음

    @InjectRepository(Entity) : module에서 import한 Entity를 본 Service에서 사용가능하도록 설정
  */
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant); //생성한 javascript 객체를 DB에 저장
      return {
        ok: true,
        restaurantId: newRestaurant.id,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      /*
        relations : ["xx"] 대신 loadRelationIds를 하면 relation이 설정된 객체 전부를 가져오는게 아니고
        id만 가져오게 된다. (모든 정보가 필요하지 않고 Id만 필요할때 사용하면 됨)
      */
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
        {
          loadRelationIds: true,
        },
      );

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      /*
        ...(category && {category}) 의 뜻
        category가 있으면, { category : category} 인 object를 return하라.

        1. category가 있으면 ...{category}로 바뀜. {category}는 {category : category}와 동일
        2. {category}앞에 ...을 추가함으로써 { }를 없애고 속성이 해체할당되게 됨
      */
      //id를 보내지 않으면 typeORM이 새로운 entity를 생성함. 기존에 존재하는 것을 update하기 위해서 id를 같이 보내야함
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      /*
        relations : ["xx"] 대신 loadRelationIds를 하면 relation이 설정된 객체 전부를 가져오는게 아니고
        id만 가져오게 된다. (모든 정보가 필요하지 않고 Id만 필요할때 사용하면 됨)
      */
      const restaurant = await this.restaurants.findOne(restaurantId, {
        loadRelationIds: true,
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      await this.restaurants.delete(restaurantId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete Restaurant',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();

      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      /*
      const category = await this.categories.findOne(
        { slug },
        { relations: ['restaurants'] },
      );
      이렇게 하면 category와 relation이 있는 모든 restaurants를 DB에서 로드하게 됨
      숫자가 많을 경우 느려짐
      */

      const category = await this.categories.findOne({ slug });

      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }

      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        order: {
          isPromoted: 'DESC',
        },
        take: 25,
        skip: (page - 1) * 25,
      }); //특정 갯수의 결과만 가져오기 위해 take 옵션을 주었음

      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 3,
        take: 3,
        order: {
          isPromoted: 'DESC',
        },
      });

      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / 3),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async searchRestaurantByName({
    page,
    query,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      /*
        ILike : Insensitive Like (like 구문을 대소문자에 상관하지않고 적용)
        Raw : raw query를 직접 작성해서 sql 실행가능
      */
      /*
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        },
        skip: (page - 1) * 25,
        take: 25,
      });
      */
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw(name => `${name} ILIKE '%${query}%'`),
        },
        skip: (page - 1) * 25,
        take: 25,
      });

      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurants',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );

      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }

      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }

      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }

      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }

      if (owner.id !== dish.restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't do that.",
        };
      }

      await this.dishes.delete(dishId);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        {
          relations: ['menu', 'orders'],
        },
      );

      return {
        restaurant,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        restaurants,
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurants.',
      };
    }
  }
}

// @Injectable()
// export class RestaurantService {
//   /*
//     생성자에서 Restaurant Entity의 Repository인 restaurants를 주입받음

//     @InjectRepository(Entity) : module에서 import한 Entity를 본 Service에서 사용가능하도록 설정
//   */
//   constructor(
//     @InjectRepository(Restaurant)
//     private readonly restaurants: Repository<Restaurant>,
//   ) {}

//   getAll(): Promise<Restaurant[]> {
//     return this.restaurants.find();
//   }

//   createRestaurant(
//     createRestaurantDto: CreateRestaurantDto,
//   ): Promise<Restaurant> {
//     const newRestaurant = this.restaurants.create(createRestaurantDto);
//     return this.restaurants.save(newRestaurant); //생성한 javascript 객체를 DB에 저장
//   }

//   updateRestaurant({ id, data }: UpdateRestaurantDto) {
//     return this.restaurants.update(id, { ...data }); //criteria로 설정한 ObjectId를 이용하여 해당 하는 데이터를 ...data의 값으로 업데이트
//   }
// }
