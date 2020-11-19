import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

//forFeature : TypeOrmModule이 특정 feature를 import 할 수 있게 해줌
@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [RestaurantResolver, RestaurantService],
})
export class RestaurantsModule {}
