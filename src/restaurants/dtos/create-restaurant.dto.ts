import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

//@ArgsType : 파라미터들을 분리된 argument로써 정의할 수 있게 해줌
//@InputType: 파라미터들을 하나의 객체로 전달하도록 설정
@ArgsType()
export class CreateRestaurantDto {
  /*
    class-validator라이브러리의 IsBoolean, IsString, Length 데코레이터 등으로 유효성 검사 가능
  */
  @Field(type => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field(type => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String)
  @IsString()
  address: string;

  @Field(type => String)
  @IsString()
  ownersName: string;
}
