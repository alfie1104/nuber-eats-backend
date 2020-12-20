import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | 'Any';

//여기서 설정한 Metadata는 Reflector.get(key, target)을 통해 가져올 수 있다.
//auth.guard에서 reflector.get<AllowedRoles>('roles',... )형태로 사용하였음
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
