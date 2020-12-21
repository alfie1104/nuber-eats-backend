import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { Category } from './entities/category.entity';
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
