import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

/*
  [For GraphQL]
  @ObjectType() : 자동으로 스키마를 빌드하기 위해 사용되는 GraphQL decorator
  @Field()

  [For TypeORM]
  @Entity() for TypeORM : TypeORM이 DB의 테이블과 대응하는 클래스를 관리할 수 있도록 해주는 Decorator
  @Column()
*/
/*
  @InputType({isAbstract:true}) : 이 InputType이 스키마에 포함되지 않길 원한다는 뜻
   - isAbstract : 어디선가 이걸 복사해서 쓴다고 명시
*/
@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  /*
     class-validator라이브러리의 IsBoolean, IsString, Length 데코레이터 등으로 유효성 검사 가능
   */
  @Field(_ => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(type => String, { defaultValue: '대전' })
  @Column()
  @IsString()
  address: string;

  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL', eager: true },
  )
  category: Category;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: User;

  @Field(type => [Dish])
  @OneToMany(
    type => Dish,
    dish => dish.restaurant,
  )
  menu: Dish[];

  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.restaurant,
  )
  orders: Order[];

  /*
  [@RelationId]
  전체 Relation정보(User Entity)를 갖는 owner와 별도로
   Relation id만 필요한 경우 사용하기 위해 @RelationId 데코레이터로
   새로운 속성을 설정한다.
  */
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(type => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil?: Date;
}
