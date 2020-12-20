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
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      //사용자가 입력한 CategoryName에서 앞,뒤 공백을 제거하고 소문자로 변환
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();

      //CategoryName에서 중간에 존재하는 공백들을 -로 변환시킨 slug생성

      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ slug: categorySlug });

      if (!category) {
        category = await this.categories.save(
          this.categories.create({
            slug: categorySlug,
            name: categoryName,
          }),
        );
      }

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
  ): Promise<EditRestaurantOutput> {}
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
