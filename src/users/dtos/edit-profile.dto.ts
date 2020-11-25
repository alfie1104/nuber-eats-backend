import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

/*
    PartialType을 이용해서 Input들을 Optional로 만들 수 있음
    PickType을 이용해서 기존 Entity의 일부 속성만 가져올 수 있음
    즉 기존 User Entity 중에서 email, password 속성만 가져온 뒤 Optional로 설정
*/
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
