import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/common/entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

/*
  [Mocking]
  UserService에서 사용되는 Repository를 Mock Repository를 이용하여 제공
  Mock은 fake implementation of function, class임. 즉 가짜 repository를 생성
  이런걸 Mocking이라고 함

  jest.fn() : mock function을 생성함 (가짜 함수)
*/
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

/*
//Record<K, T> : Construct a type with a set of properties K(Key) of type T(Type). 타입 T를 갖는 요소 K의 집합
//Partial : 모든 속성을 optional로 만듬
//keyof : 모든 key를 가져옴 (typescript에서 사용 가능)
  아래 type MockReposoitory는 Repository의 모든 함수를 뜻하는데 각 함수들의 타입을 jest.Mock으로 설정한 것임(가짜 함수)
*/
type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;

  beforeAll(async () => {
    //테스트를 시작하기 전 UserService를 제공하는 테스팅 모듈 생성
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exists', async () => {
      /*
        [mockResolvedValue]
        원래는 usersRepository의 findOne은 DB를 검색하게 되지만,
        jest의 mock을 이용한 가짜함수덕분에 findOne의 반환값을 속일 수 있음.(DB 사용 X)

        mock을 사용하면 실제 코드의 특정 부분(본 코드의 경우 usersRepository.findOne 함수)을 mock함수로 대체해서 구동시키게 됨

        즉, createAccount 자체의 로직 검사에만 집중가능
        (DB 접근과 같이 다른 함수에 의존되는 부분은 모두 mock함수로 대체해서 createAccount를 속이게됨)
      */
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'lalalalala',
      }); //createAccount를 속이기위해 가짜 유저 형태를 생성
      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
