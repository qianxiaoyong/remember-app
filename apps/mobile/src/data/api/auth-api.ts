import type {
  LogoutResponse,
  SendSmsCodeRequest,
  SendSmsCodeResponse,
  SessionUser,
  VerifySmsCodeRequest,
  VerifySmsCodeResponse,
} from '@remember/contracts';
import {
  logoutResponseSchema,
  sendSmsCodeResponseSchema,
  sessionUserSchema,
  verifySmsCodeResponseSchema,
} from '@remember/contracts';
import { apiFetchJson } from './api-client';

export async function sendSmsCodeRequest(input: SendSmsCodeRequest): Promise<SendSmsCodeResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/auth/sms/send', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return sendSmsCodeResponseSchema.parse(body);
}

export async function verifySmsCodeRequest(
  input: VerifySmsCodeRequest,
): Promise<VerifySmsCodeResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/auth/sms/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return verifySmsCodeResponseSchema.parse(body);
}

export async function fetchCurrentUser(sessionToken: string): Promise<SessionUser> {
  const body = await apiFetchJson<unknown>('/api/v1/auth/me', {
    method: 'GET',
    sessionToken,
  });
  return sessionUserSchema.parse(body);
}

export async function logoutRequest(sessionToken: string): Promise<LogoutResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/auth/logout', {
    method: 'POST',
    sessionToken,
  });
  return logoutResponseSchema.parse(body);
}
