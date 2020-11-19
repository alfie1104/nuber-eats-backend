import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  /*
     class-validator라이브러리의 IsBoolean, IsString, Length 데코레이터 등으로 유효성 검사 가능
   */
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(_ => String)
  @Column()
  @IsString()
  @Length(5, 20)
  name: string;

  @Field(type => Boolean, { nullable: true, defaultValue: true }) // default 값 설정 for graphQL Field. //nullable : null값 가능여부 설정
  @Column({ default: true }) // default값 설정 for DB
  @IsOptional() // 있어도 되고 없어도 되는 값으로 설정 for DTO Validation
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String, { defaultValue: '대전' })
  @Column()
  @IsString()
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  ownersName: string;

  @Field(type => String)
  @Column()
  @IsString()
  categoryName: string;
}
