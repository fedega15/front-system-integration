import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Only call the parent method, do not manually decode or assign request.user
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.error(
        '╔═══════════════ Authentication Error ═══════════════',
      );
      this.logger.error('║ Error:', err?.message || 'No user found');
      this.logger.error('║ Info:', info);
      this.logger.error('╚═══════════════════════════════════════════════════');
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
