import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  @Field(type => String)
  name: string;

  @Field(type => [String], { nullable: true })
  choices?: string[];

  @Field(type => Int)
  extra: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  /*
     class-validator라이브러리의 IsBoolean, IsString, Length 데코레이터 등으로 유효성 검사 가능
   */
  @Field(type => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(type => String)
  @Column()
  @Length(5, 140)
  description: string;

  @Field(type => Restaurant)
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.menu,
    { onDelete: 'CASCADE' },
  )
  restaurant: Restaurant;

  /*
  [@RelationId]
  전체 Relation정보(Restaurant Entity)를 갖는 restaurant와 별도로
   Relation id만 필요한 경우 사용하기 위해 @RelationId 데코레이터로
   새로운 속성을 설정한다.

   //GraphQL schema에 나타나지 않도록 하기 위해서 @Field 데코레이터는 사용하지 않았음
  */
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  /*
    type:"json"을 이용해서 데이터를 json형태로 저장할 수 있다.
    여러정보를 하나의 칼럼에 저장하기 위해서는 별도의 entity를 만들고 relation을 생성하거나,
    지금처럼 json 형태로 저장하거나 둘 중 하나를 필요에 맞게 사용하면 된다.

    json 데이터 타입은 MySQL, PostgreSQL에서 지원됨
  */
  @Field(type => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
