import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { mockAuthRepository } from './mocks/auth.repository.mock';
import { JwtService } from '@nestjs/jwt';
import { mockJwtService } from './mocks/jwt.service.mock';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      const userMail = 'test@mail.com';
      const userPassword = '1234';

      const dto = {
        quantity: 5,
      };

      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      // Act + Assert
      await expect(service.login(userMail, userPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(
        'test@mail.com',
      );

      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password dont match with user', async () => {
      // Arrange
      const userMail = 'test@mail.com';
      const userPassword = '1234';

      const dto = {
        quantity: 5,
      };

      const hash = await bcrypt.hash('senha-correta', 10);

      mockAuthRepository.findUserByEmail.mockResolvedValue({
        id: '1',
        email: 'teste@email.com',
        password: hash,
      });

      // Act + Assert
      await expect(service.login(userMail, userPassword)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(
        'test@mail.com',
      );

      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('should call repository find user by email', async () => {
      // Arrange
      const userMail = 'test@mail.com';
      const userPassword = '1234';

      const dto = {
        quantity: 5,
      };

      const hash = await bcrypt.hash('1234', 10);

      mockAuthRepository.findUserByEmail.mockResolvedValue({
        id: '1',
        email: 'teste@email.com',
        password: hash,
      });

      const result = await service.login(userMail, userPassword);

      // Assert
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(
        'test@mail.com',
      );

      expect(result).toEqual({
        token: undefined,
      });
    });
  });
});
