import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, password: string) {
    if (email !== 'admin@email.com' || password !== '123456') {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: 'fake-jwt-token',
    };
  }
}
