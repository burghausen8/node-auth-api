import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { mockAuthRepository } from './mocks/auth.repository.mock';
import { JwtService } from '@nestjs/jwt';
import { mockJwtService } from './mocks/jwt.service.mock';
import { AuthPublisher } from './publishers/auth.publisher';
import { mockAuthPublisher } from './mocks/auth.publisher.mock';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

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
        {
          provide: AuthPublisher,
          useValue: mockAuthPublisher,
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

  describe('register', () => {
    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      mockAuthRepository.findUserByEmail.mockResolvedValue({
        id: '1',
        email: 'test@mail.com',
      });

      // Act + Assert
      await expect(
        service.register({ email: 'test@mail.com', password: '1234' }),
      ).rejects.toThrow(ConflictException);

      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });

    it('should create user and publish event when user does not exist', async () => {
      // Arrange
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      mockAuthRepository.createUser.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
      });
      mockAuthRepository.deleteVerificationTokensByUser.mockResolvedValue(null);
      mockAuthRepository.createVerificationToken.mockResolvedValue(null);

      // Act
      const result = await service.register({
        email: 'test@mail.com',
        password: '1234',
      });

      // Assert
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(
        'test@mail.com',
      );
      expect(mockAuthRepository.createUser).toHaveBeenCalledTimes(1);
      expect(
        mockAuthRepository.deleteVerificationTokensByUser,
      ).toHaveBeenCalledWith('user-1');
      expect(mockAuthRepository.createVerificationToken).toHaveBeenCalledTimes(
        1,
      );
      expect(mockAuthPublisher.publishUserRegistered).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          email: 'test@mail.com',
        }),
      );
      expect(result).toEqual({ id: 'user-1', email: 'test@mail.com' });
    });
  });

  describe('resendVerification', () => {
    it('should return without action when user does not exist', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      // Act
      await service.resendVerification('test@mail.com');

      // Assert
      expect(
        mockAuthRepository.resendVerificationEmailTransaction,
      ).not.toHaveBeenCalled();
      expect(mockAuthPublisher.publishUserRegistered).not.toHaveBeenCalled();
    });

    it('should return without action when user is already verified', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: true,
        updatedAt: new Date(),
      });

      // Act
      await service.resendVerification('test@mail.com');

      // Assert
      expect(
        mockAuthRepository.resendVerificationEmailTransaction,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when called within 60 seconds of last request', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: false,
        updatedAt: new Date(), // now — within 60s
      });

      // Act + Assert
      await expect(service.resendVerification('test@mail.com')).rejects.toThrow(
        BadRequestException,
      );

      expect(
        mockAuthRepository.resendVerificationEmailTransaction,
      ).not.toHaveBeenCalled();
    });

    it('should resend verification email when user is not verified and cooldown has passed', async () => {
      // Arrange
      const pastDate = new Date(Date.now() - 61_000); // 61 seconds ago
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: false,
        updatedAt: pastDate,
      });
      mockAuthRepository.resendVerificationEmailTransaction.mockResolvedValue(
        null,
      );

      // Act
      await service.resendVerification('test@mail.com');

      // Assert
      expect(
        mockAuthRepository.resendVerificationEmailTransaction,
      ).toHaveBeenCalledWith('user-1', expect.any(String), expect.any(Date));
      expect(mockAuthPublisher.publishUserRegistered).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          email: 'test@mail.com',
        }),
      );
    });
  });

  describe('validateVerificationToken', () => {
    it('should return without action when user does not exist', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      // Act
      await service.validateVerificationToken({
        email: 'test@mail.com',
        token: '123456',
      });

      // Assert
      expect(mockAuthRepository.findVerificationToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.validateUser).not.toHaveBeenCalled();
    });

    it('should return without action when user is already verified', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: true,
      });

      // Act
      await service.validateVerificationToken({
        email: 'test@mail.com',
        token: '123456',
      });

      // Assert
      expect(mockAuthRepository.findVerificationToken).not.toHaveBeenCalled();
      expect(mockAuthRepository.validateUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when token is invalid', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: false,
      });
      mockAuthRepository.findVerificationToken.mockResolvedValue(null);

      // Act + Assert
      await expect(
        service.validateVerificationToken({
          email: 'test@mail.com',
          token: 'wrong-token',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockAuthRepository.validateUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when token is expired', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: false,
      });
      mockAuthRepository.findVerificationToken.mockResolvedValue({
        id: 'token-1',
        code: '123456',
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      // Act + Assert
      await expect(
        service.validateVerificationToken({
          email: 'test@mail.com',
          token: '123456',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockAuthRepository.validateUser).not.toHaveBeenCalled();
    });

    it('should validate user when token is valid and not expired', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@mail.com',
        isVerified: false,
      });
      mockAuthRepository.findVerificationToken.mockResolvedValue({
        id: 'token-1',
        code: '123456',
        expiresAt: new Date(Date.now() + 60_000), // valid
      });
      mockAuthRepository.validateUser.mockResolvedValue(null);

      // Act
      await service.validateVerificationToken({
        email: 'test@mail.com',
        token: '123456',
      });

      // Assert
      expect(mockAuthRepository.validateUser).toHaveBeenCalledWith('user-1');
    });
  });
});
