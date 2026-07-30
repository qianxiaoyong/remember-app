import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type {
  LogoutResponse,
  SendSmsCodeResponse,
  SessionUser,
  VerifySmsCodeResponse,
  WriteProbeResponse,
} from '@remember/contracts';
import { sendSmsCodeRequestSchema, verifySmsCodeRequestSchema } from '@remember/contracts';
import { AuthGuard, requireAuthContext, type RequestWithAuth } from './auth.guard.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms/send')
  @HttpCode(200)
  sendSmsCode(@Body() body: unknown): Promise<SendSmsCodeResponse> {
    const input = sendSmsCodeRequestSchema.parse(body);
    return this.authService.sendSmsCode(input);
  }

  @Post('sms/verify')
  @HttpCode(200)
  verifySmsCode(@Body() body: unknown): Promise<VerifySmsCodeResponse> {
    const input = verifySmsCodeRequestSchema.parse(body);
    return this.authService.verifySmsCode(input);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  logout(@Req() request: RequestWithAuth): Promise<LogoutResponse> {
    return this.authService.logout(requireAuthContext(request));
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Req() request: RequestWithAuth): Promise<SessionUser> {
    return this.authService.getCurrentUser(requireAuthContext(request));
  }

  @Post('device/write-probe')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  writeProbe(@Req() request: RequestWithAuth): WriteProbeResponse {
    requireAuthContext(request);
    return this.authService.writeProbe();
  }
}
