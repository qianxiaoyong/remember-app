import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedAdminContext } from './admin-auth.service.js';
import { AdminAuthService } from './admin-auth.service.js';

export interface RequestWithAdminAuth {
  headers: {
    authorization?: string;
  };
  adminAuth?: AuthenticatedAdminContext;
}

function readBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authorizationHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAdminAuth>();
    const token = readBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException({ code: 'ADMIN_SESSION_MISSING', message: '请先登录' });
    }

    request.adminAuth = await this.adminAuthService.resolveAuthenticatedContext(token);
    return true;
  }
}

function requireAdminAuthContext(request: RequestWithAdminAuth): AuthenticatedAdminContext {
  if (!request.adminAuth) {
    throw new UnauthorizedException({ code: 'ADMIN_SESSION_MISSING', message: '请先登录' });
  }
  return request.adminAuth;
}

export { requireAdminAuthContext };
