import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { RedeemCodeResponse } from '@remember/contracts';
import { redeemCodeRequestSchema } from '@remember/contracts';
import { AuthGuard, requireAuthContext, type RequestWithAuth } from '../auth/auth.guard.js';
import { RedemptionService } from './redemption.service.js';

@Controller('redemption')
export class RedemptionController {
  constructor(private readonly redemptionService: RedemptionService) {}

  @Post('redeem')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  redeem(@Req() request: RequestWithAuth, @Body() body: unknown): Promise<RedeemCodeResponse> {
    const auth = requireAuthContext(request);
    const input = redeemCodeRequestSchema.parse(body);
    return this.redemptionService.redeem(auth.userId, input.code);
  }
}
