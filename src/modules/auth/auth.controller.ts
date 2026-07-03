import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guards';
import { Roles } from './decorators/roles.decorators';
import type { Request } from 'express';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ValidateVerificationTokenDto } from './dto/validate-verification-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }

  @Post('resend-verification')
  @HttpCode(200)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.authService.resendVerification(dto.email);

    return {
      message:
        'Se existir uma conta pendente para este e-mail, um novo código foi enviado.',
    };
  }

  @Post('validate-verification-token')
  @HttpCode(200)
  async validateVerificationToken(@Body() dto: ValidateVerificationTokenDto) {
    await this.authService.validateVerificationToken(dto);

    return {
      message: 'Conta verificada com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAuth() {
    const test = 1;
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
