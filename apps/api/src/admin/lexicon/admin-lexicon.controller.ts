import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  adminLexiconBatchGetRequestSchema,
  adminLexiconEnrichRequestSchema,
  adminLexiconPatchRequestSchema,
  adminLexiconSearchQuerySchema,
} from '@remember/contracts';
import {
  AdminAuthGuard,
  requireAdminAuthContext,
  type RequestWithAdminAuth,
} from '../../admin-auth/admin-auth.guard.js';
import { AdminLexiconService } from './admin-lexicon.service.js';

@Controller('admin/lexicon')
@UseGuards(AdminAuthGuard)
export class AdminLexiconController {
  constructor(private readonly service: AdminLexiconService) {}

  @Get('search')
  search(@Query() query: unknown) {
    return this.service.search(adminLexiconSearchQuerySchema.parse(query));
  }

  @Get('by-form/:formKey')
  getByForm(@Param('formKey') formKey: string) {
    return this.service.getByForm(formKey);
  }

  @Post('batch-get')
  @HttpCode(200)
  batchGet(@Body() body: unknown) {
    return this.service.batchGet(adminLexiconBatchGetRequestSchema.parse(body));
  }

  @Patch()
  patch(@Req() request: RequestWithAdminAuth, @Body() body: unknown) {
    const admin = requireAdminAuthContext(request);
    return this.service.patch(admin.adminUserId, adminLexiconPatchRequestSchema.parse(body));
  }

  @Post('enrich')
  @HttpCode(200)
  enrich(@Body() body: unknown) {
    return this.service.enrich(adminLexiconEnrichRequestSchema.parse(body));
  }

  @Get(':lemmaKey')
  getDetail(@Param('lemmaKey') lemmaKey: string) {
    return this.service.getDetail(lemmaKey);
  }
}
