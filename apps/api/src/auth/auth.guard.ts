import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequestContext } from './auth.service.js';
import { AuthService } from './auth.service.js';

export interface RequestWithAuth {
  headers: {
    authorization?: string;
  };
  auth?: AuthenticatedRequestContext;
}

function readBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authorizationHeader.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

async function tryReadAuthContext(
  authService: AuthService,
  request: RequestWithAuth,
): Promise<AuthenticatedRequestContext | null> {
  const token = readBearerToken(request.headers.authorization);
  if (!token) {
    return null;
  }
  try {
    return await authService.resolveAuthenticatedContext(token);
  } catch {
    return null;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = readBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException({ code: 'SESSION_MISSING', message: '请先登录' });
    }

    request.auth = await this.authService.resolveAuthenticatedContext(token);
    return true;
  }
}

function requireAuthContext(request: RequestWithAuth): AuthenticatedRequestContext {
  if (!request.auth) {
    throw new UnauthorizedException({ code: 'SESSION_MISSING', message: '请先登录' });
  }
  return request.auth;
}

export { requireAuthContext, tryReadAuthContext };
