import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  LogoutResponse,
  SendSmsCodeRequest,
  SendSmsCodeResponse,
  SessionUser,
  VerifySmsCodeRequest,
  VerifySmsCodeResponse,
  WriteProbeResponse,
} from '@remember/contracts';
import {
  logoutResponseSchema,
  sendSmsCodeResponseSchema,
  sessionUserSchema,
  verifySmsCodeResponseSchema,
  writeProbeResponseSchema,
} from '@remember/contracts';
import { readAuthConfig } from '../config/read-auth-config.js';
import type { SmsSender } from '../sms/sms-sender.port.js';
import { SMS_SENDER } from '../sms/sms-sender.port.js';
import { AuthRepository } from './auth.repository.js';
import {
  createSessionToken,
  createSmsCode,
  hashPhone,
  hashSessionToken,
  hashSmsCode,
  maskPhone,
} from './crypto.js';

const SMS_CODE_TTL_MS = 5 * 60 * 1000;
const SMS_RESEND_AFTER_SECONDS = 60;
const SMS_EXPIRES_IN_SECONDS = 300;
const SMS_DAILY_LIMIT = 10;
const SMS_MAX_ATTEMPTS = 5;

export interface AuthenticatedRequestContext {
  userId: string;
  deviceId: string;
  sessionId: string;
}

@Injectable()
export class AuthService {
  private readonly config = readAuthConfig();

  constructor(
    private readonly authRepository: AuthRepository,
    @Inject(SMS_SENDER) private readonly smsSender: SmsSender,
  ) {}

  async sendSmsCode(input: SendSmsCodeRequest): Promise<SendSmsCodeResponse> {
    const phoneHash = hashPhone(input.phone, this.config.phonePepper);
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const latestChallenge = await this.authRepository.findLatestSmsChallenge(phoneHash);
    if (latestChallenge) {
      const elapsedMs = now.getTime() - latestChallenge.createdAt.getTime();
      if (elapsedMs < this.config.smsResendIntervalMs) {
        const resendAfterSeconds = Math.ceil((this.config.smsResendIntervalMs - elapsedMs) / 1000);
        throw new HttpException(
          { code: 'SMS_RESEND_TOO_SOON', message: '请稍后再试', resendAfterSeconds },
          429,
        );
      }
    }

    const sentToday = await this.authRepository.countSmsSentToday(phoneHash, dayStart);
    if (sentToday >= SMS_DAILY_LIMIT) {
      throw new HttpException({ code: 'SMS_DAILY_LIMIT', message: '今日验证码次数已用完' }, 429);
    }

    const code = createSmsCode(this.config.smsMockEnabled);
    const expiresAt = new Date(now.getTime() + SMS_CODE_TTL_MS);
    const challenge = await this.authRepository.createSmsChallenge({
      phoneHash,
      codeHash: 'pending',
      expiresAt,
    });
    const codeHash = hashSmsCode(challenge.id, code, this.config.phonePepper);
    await this.authRepository.updateChallengeCodeHash(challenge.id, codeHash);

    if (!this.config.smsMockEnabled) {
      await this.smsSender.sendCode({ phone: input.phone, code });
    }

    return sendSmsCodeResponseSchema.parse({
      expiresInSeconds: SMS_EXPIRES_IN_SECONDS,
      resendAfterSeconds:
        this.config.smsResendIntervalMs > 0
          ? Math.ceil(this.config.smsResendIntervalMs / 1000)
          : SMS_RESEND_AFTER_SECONDS,
    });
  }

  async verifySmsCode(input: VerifySmsCodeRequest): Promise<VerifySmsCodeResponse> {
    const phoneHash = hashPhone(input.phone, this.config.phonePepper);
    const challenge = await this.authRepository.findLatestSmsChallenge(phoneHash);
    const now = new Date();

    if (!challenge || challenge.consumedAt) {
      throw new UnauthorizedException({ code: 'SMS_CODE_INVALID', message: '验证码无效' });
    }
    if (challenge.expiresAt.getTime() <= now.getTime()) {
      throw new UnauthorizedException({ code: 'SMS_CODE_EXPIRED', message: '验证码已过期' });
    }
    if (challenge.attemptCount >= SMS_MAX_ATTEMPTS) {
      throw new UnauthorizedException({ code: 'SMS_CODE_LOCKED', message: '验证码尝试次数过多' });
    }

    const expectedHash = hashSmsCode(challenge.id, input.code, this.config.phonePepper);
    if (expectedHash !== challenge.codeHash) {
      await this.authRepository.incrementChallengeAttempts(challenge.id);
      throw new UnauthorizedException({ code: 'SMS_CODE_INVALID', message: '验证码无效' });
    }

    await this.authRepository.consumeChallenge(challenge.id, now);

    let user = await this.authRepository.findUserByPhoneHash(phoneHash);
    user ??= await this.authRepository.createUser({
      phoneHash,
      maskedPhone: maskPhone(input.phone),
      mainDeviceId: input.deviceId,
    });

    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    await this.authRepository.switchMainDevice({
      userId: user.id,
      deviceId: input.deviceId,
      tokenHash,
      lastActiveAt: now,
    });

    return verifySmsCodeResponseSchema.parse({
      token,
      user: this.toSessionUser(user.id, user.maskedPhone, user.displayName),
    });
  }

  async logout(context: AuthenticatedRequestContext): Promise<LogoutResponse> {
    await this.authRepository.revokeSession(context.sessionId, new Date());
    return logoutResponseSchema.parse({ ok: true });
  }

  async getCurrentUser(context: AuthenticatedRequestContext): Promise<SessionUser> {
    const user = await this.authRepository.findUserById(context.userId);
    if (!user) {
      throw new UnauthorizedException({ code: 'SESSION_INVALID', message: '会话无效' });
    }
    return this.toSessionUser(user.id, user.maskedPhone, user.displayName);
  }

  writeProbe(): WriteProbeResponse {
    return writeProbeResponseSchema.parse({ ok: true });
  }

  async resolveAuthenticatedContext(token: string): Promise<AuthenticatedRequestContext> {
    const tokenHash = hashSessionToken(token);
    const session = await this.authRepository.findSessionByTokenHash(tokenHash);
    const now = new Date();

    if (!session || session.revokedAt) {
      throw new UnauthorizedException({ code: 'SESSION_INVALID', message: '会话无效' });
    }

    const ttlMs = this.config.sessionTtlDays * 24 * 60 * 60 * 1000;
    if (now.getTime() - session.lastActiveAt.getTime() > ttlMs) {
      await this.authRepository.revokeSession(session.id, now);
      throw new UnauthorizedException({ code: 'SESSION_EXPIRED', message: '会话已过期' });
    }

    if (session.user.status !== 'active') {
      throw new ForbiddenException({ code: 'ACCOUNT_DISABLED', message: '账号不可用' });
    }

    if (session.user.mainDeviceId !== session.deviceId) {
      throw new ForbiddenException({ code: 'NOT_MAIN_DEVICE', message: '账号已在其他设备登录' });
    }

    await this.authRepository.touchSession(session.id, now);

    return {
      userId: session.userId,
      deviceId: session.deviceId,
      sessionId: session.id,
    };
  }

  private toSessionUser(
    userId: string,
    maskedPhone: string,
    displayName: string | null,
  ): SessionUser {
    return sessionUserSchema.parse({
      userId,
      maskedPhone,
      displayName: displayName?.trim() ?? '监护人',
    });
  }
}
