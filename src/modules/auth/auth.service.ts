import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { AuthRepository } from './auth.repository';
import { AuthPublisher } from './publishers/auth.publisher';
import { differenceInSeconds } from 'date-fns';
import { ValidateVerificationTokenDto } from './dto/validate-verification-token.dto';

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

  async resendVerification(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      return;
    }

    if (user.isVerified) {
      return;
    }

    const now = new Date();

    if (differenceInSeconds(now, user.updatedAt) < 60) {
      throw new BadRequestException(
        'Aguarde 60 segundos para solicitar um novo código.',
      );
    }

    const verificationCode = this.generateVerificationCode();

    const expiresAt = this.generateVerificationExpiration();

    await this.authRepository.resendVerificationEmailTransaction(
      user.id,
      verificationCode,
      expiresAt,
    );

    this.authPublisher.publishUserRegistered({
      userId: user.id,
      email: user.email,
      verificationCode,
    });
  }

  async validateVerificationToken(dto: ValidateVerificationTokenDto) {
    const user = await this.authRepository.findByEmail(dto.email);

    if (!user || user.isVerified) {
      return;
    }

    const verificationToken = await this.authRepository.findVerificationToken(
      user.id,
      dto.token,
    );

    if (!verificationToken) {
      throw new BadRequestException('Token inválido');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Token expirado');
    }

    await this.authRepository.validateUser(user.id);
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
