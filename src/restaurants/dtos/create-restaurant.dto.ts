import { ArgsType, Field, InputType } from '@nestjs/graphql';

//@ArgsType : 파라미터들을 분리된 argument로써 정의할 수 있게 해줌
//@InputType: 파라미터들을 하나의 객체로 전달하도록 설정
@ArgsType()
export class CreateRestaurantDto {
  @Field(type => String)
  name: string;

  @Field(type => Boolean)
  isVegan: boolean;

  @Field(type => String)
  address: string;

  @Field(type => String)
  ownersName: string;
}
