import { InputType, OmitType } from '@nestjs/graphql';
// import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

//@ArgsType : 파라미터들을 분리된 argument로써 정의할 수 있게 해줌
//@InputType: 파라미터들을 하나의 객체로 전달하도록 설정
// @ArgsType()
// export class CreateRestaurantDto {
//   /*
//     class-validator라이브러리의 IsBoolean, IsString, Length 데코레이터 등으로 유효성 검사 가능
//   */
//   @Field(type => String)
//   @IsString()
//   @Length(5, 10)
//   name: string;

//   @Field(type => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(type => String)
//   @IsString()
//   address: string;

//   @Field(type => String)
//   @IsString()
//   ownersName: string;
// }

/*
  [Nestjs/graphql의 MappedTypes]
  MappedTypes 기능을 이용하여 Dto를 매번 생성하지 않아도 된다.(만들어 놓은 entity정보를 상속해서 생성가능)
  이렇게 하면 entity의 칼럼이 변경되었을 때, dto를 개별적으로 변경하지 않아도 된다.
  (entity만 수정하면 dto는 알아서 변경됨)

  Parent인 Restaurant는 @ObjectType이지만, child인 CreateRestaurantDto는 @InputType이므로,
  OmitType(부모, [제외할 속성])에 추가 파라미터로 InputType을 입력한다.
  (만약 Parent와 Child의 타입이 같다면 추가 파라미터를 전달할 필요없음)

  혹은 이렇게 하지 않고,

  Restaurant Entity에 
  @InputType({ isAbstract: true })
  @ObjectType
  라는 데코레이터를 붙임으로써, 기본적으로는 ObjectType이지만, 
  다른 곳에서 상속 받을 때는 InputType으로 상속한다고 명시할 수도 있다.
*/
@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
