import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

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
@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
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

  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.category,
  )
  restaurants: Restaurant[];
}
