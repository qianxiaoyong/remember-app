import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { ListMyPackAccessResponse } from '@remember/contracts';
import { AuthGuard, requireAuthContext, type RequestWithAuth } from '../auth/auth.guard.js';
import { PackAccessService } from './pack-access.service.js';

@Controller('me/pack-access')
export class PackAccessController {
  constructor(private readonly packAccessService: PackAccessService) {}

  @Get()
  @UseGuards(AuthGuard)
  listMyPackAccess(@Req() request: RequestWithAuth): Promise<ListMyPackAccessResponse> {
    const auth = requireAuthContext(request);
    return this.packAccessService.listMyPackAccess(auth.userId);
  }
}
