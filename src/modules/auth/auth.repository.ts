import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationTokenType } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  createUser(data: { email: string; password: string }) {
    return this.prisma.user.create({
      data,
    });
  }

  createVerificationToken(userId: string, code: string, expiresAt: Date) {
    return this.prisma.verificationToken.create({
      data: {
        code,
        expiresAt,
        type: VerificationTokenType.EMAIL_VERIFICATION,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  findVerificationToken(code: string) {
    return this.prisma.verificationToken.findFirst({
      where: {
        code,
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
      include: {
        user: true,
      },
    });
  }

  verifyUser(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isVerified: true,
      },
    });
  }

  deleteVerificationToken(id: string) {
    return this.prisma.verificationToken.delete({
      where: {
        id,
      },
    });
  }

  deleteVerificationTokensByUser(userId: string) {
    return this.prisma.verificationToken.deleteMany({
      where: {
        userId,
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
    });
  }

  findVerificationTokenByUser(userId: string) {
    return this.prisma.verificationToken.findFirst({
      where: {
        userId,
        type: VerificationTokenType.EMAIL_VERIFICATION,
      },
    });
  }
}
