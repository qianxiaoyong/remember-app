import { Injectable } from '@nestjs/common';
import type { Session, SmsChallenge, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface CreateSmsChallengeInput {
  phoneHash: string;
  codeHash: string;
  expiresAt: Date;
}

export interface CreateSessionInput {
  tokenHash: string;
  userId: string;
  deviceId: string;
  lastActiveAt: Date;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSmsChallenge(input: CreateSmsChallengeInput): Promise<SmsChallenge> {
    return this.prisma.smsChallenge.create({ data: input });
  }

  findLatestSmsChallenge(phoneHash: string): Promise<SmsChallenge | null> {
    return this.prisma.smsChallenge.findFirst({
      where: { phoneHash },
      orderBy: { createdAt: 'desc' },
    });
  }

  countSmsSentToday(phoneHash: string, dayStart: Date): Promise<number> {
    return this.prisma.smsChallenge.count({
      where: {
        phoneHash,
        createdAt: { gte: dayStart },
      },
    });
  }

  incrementChallengeAttempts(challengeId: string): Promise<SmsChallenge> {
    return this.prisma.smsChallenge.update({
      where: { id: challengeId },
      data: { attemptCount: { increment: 1 } },
    });
  }

  consumeChallenge(challengeId: string, consumedAt: Date): Promise<SmsChallenge> {
    return this.prisma.smsChallenge.update({
      where: { id: challengeId },
      data: { consumedAt },
    });
  }

  updateChallengeCodeHash(challengeId: string, codeHash: string): Promise<SmsChallenge> {
    return this.prisma.smsChallenge.update({
      where: { id: challengeId },
      data: { codeHash },
    });
  }

  findUserByPhoneHash(phoneHash: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phoneHash } });
  }

  createUser(input: {
    phoneHash: string;
    maskedPhone: string;
    mainDeviceId: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        phoneHash: input.phoneHash,
        maskedPhone: input.maskedPhone,
        mainDeviceId: input.mainDeviceId,
      },
    });
  }

  findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  findSessionByTokenHash(tokenHash: string): Promise<(Session & { user: User }) | null> {
    return this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  revokeSession(sessionId: string, revokedAt: Date): Promise<Session> {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt },
    });
  }

  touchSession(sessionId: string, lastActiveAt: Date): Promise<Session> {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt },
    });
  }

  switchMainDevice(input: {
    userId: string;
    deviceId: string;
    tokenHash: string;
    lastActiveAt: Date;
  }): Promise<Session> {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: input.userId },
        data: { mainDeviceId: input.deviceId },
      });
      return tx.session.create({
        data: {
          tokenHash: input.tokenHash,
          userId: input.userId,
          deviceId: input.deviceId,
          lastActiveAt: input.lastActiveAt,
        },
      });
    });
  }
}
