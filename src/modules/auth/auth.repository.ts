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

  findVerificationToken(userId: string, code: string) {
    return this.prisma.verificationToken.findFirst({
      where: {
        userId,
        code,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
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

  async resendVerificationEmailTransaction(
    userId: string,
    code: string,
    expiresAt: Date,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: {
          userId,
        },
      });

      await tx.verificationToken.create({
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

      await tx.user.update({
        where: {
          id: userId,
        },
        data: { updatedAt: new Date() },
      });
    });
  }

  async validateUser(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.deleteMany({
        where: {
          userId,
        },
      });

      await tx.user.update({
        where: {
          id: userId,
        },
        data: { isVerified: true },
      });
    });
  }
}
