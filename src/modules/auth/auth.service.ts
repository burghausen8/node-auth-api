import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { AuthRepository } from './auth.repository';
import { AuthPublisher } from './publishers/auth.publisher';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly authPublisher: AuthPublisher,
  ) {}

  async login(email: string, password: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
    };
  }

  async register(data: { email: string; password: string }) {
    const userExists = await this.authRepository.findUserByEmail(data.email);

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.authRepository.createUser({
      email: data.email,
      password: hashedPassword,
    });

    await this.authRepository.deleteVerificationTokensByUser(user.id);

    const verificationCode = this.generateVerificationCode();

    const expiresAt = this.generateVerificationExpiration();

    await this.authRepository.createVerificationToken(
      user.id,
      verificationCode,
      expiresAt,
    );

    this.authPublisher.publishUserRegistered({
      userId: user.id,
      email: user.email,
      verificationCode: verificationCode,
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateVerificationExpiration(): Date {
    const expiresAt = new Date();

    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return expiresAt;
  }
}
