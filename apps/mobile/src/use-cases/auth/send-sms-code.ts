import { sendSmsCodeRequest } from '../../data/api/auth-api';

export async function sendSmsCode(phone: string): Promise<{ resendAfterSeconds: number }> {
  const response = await sendSmsCodeRequest({ phone });
  return { resendAfterSeconds: response.resendAfterSeconds };
}
