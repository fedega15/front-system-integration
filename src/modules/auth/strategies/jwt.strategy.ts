import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import { SensitiveDataService } from '../application/service/sensitive-data.service';
import { JwtPayload } from '../application/types/auth-interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly sensitiveDataService: SensitiveDataService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          this.logger.debug(
            'JWT Strategy - Extracting token from cookies:',
            request?.cookies,
          );
          const token = request?.cookies?.token;
          if (token) {
            try {
              const decoded = jwt.decode(token);
              this.logger.debug('JWT Strategy - Decoded token:', decoded);
              return token;
            } catch (error) {
              this.logger.error('JWT Strategy - Error decoding token:', error);
            }
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });

    this.logger.debug(
      'JWT Strategy - Using secret from process.env.JWT_SECRET',
    );
  }

  async validate(payload: JwtPayload) {
    this.logger.debug('JWT Strategy - Validating payload:', payload);

    if (!payload) {
      this.logger.error('JWT Strategy - Invalid payload structure:', payload);
      throw new UnauthorizedException('Token inválido');
    }

    try {
      // aca uso el nuevo servicio de sensitive data
      const sensitiveData = await this.sensitiveDataService.getSensitiveData(
        payload.id,
      );

      this.logger.debug('JWT Strategy - Retrieved sensitive data:', {
        hasFrontSystem: !!sensitiveData.frontSystem,
        hasWooCommerce: !!sensitiveData.wooCommerce,
        wooCommerceData: sensitiveData.wooCommerce,
      });

      const user = {
        userId: payload.id,
        username: payload.username,
        role: payload.role,
        Orgnum: payload.Orgnum,
        LegalName: payload.LegalName,
        apiKeys: sensitiveData,
      };

      this.logger.debug('JWT Strategy - Constructed user object:', {
        userId: user.userId,
        username: user.username,
        hasApiKeys: !!user.apiKeys,
        hasWooCommerce: !!user.apiKeys?.wooCommerce,
        wooCommerceData: user.apiKeys?.wooCommerce,
      });

      return user;
    } catch (error) {
      this.logger.error(
        'JWT Strategy - Error retrieving sensitive data:',
        error,
      );
      throw new UnauthorizedException('Error retrieving user data');
    }
  }
}
