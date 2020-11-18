import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/*
  [For GraphQL]
  @ObjectType() : 자동으로 스키마를 빌드하기 위해 사용되는 GraphQL decorator
  @Field()

  [For TypeORM]
  @Entity() for TypeORM : TypeORM이 DB의 테이블과 대응하는 클래스를 관리할 수 있도록 해주는 Decorator
  @Column()
*/
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(_ => String)
  @Column()
  name: string;

  @Field(type => Boolean)
  @Column()
  isVegan: boolean;

  @Field(type => String)
  @Column()
  address: string;

  @Field(type => String)
  @Column()
  ownersName: string;

  @Field(type => String)
  @Column()
  categoryName: string;
}
