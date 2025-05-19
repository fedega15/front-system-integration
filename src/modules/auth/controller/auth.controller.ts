import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import { AuthService } from '../application/service/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/me')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    return this.authService.getProfile(req, res);
  }

  @Post('/login')
  async login(@Body() { username, password }, @Res() res: Response) {
    try {
      const token = await this.authService.login(username, password);
      // Configurar la cookie con el token
      res.cookie('token', token, {
        httpOnly: true, // 🔒 Evita acceso desde JavaScript (más seguro)
        secure: process.env.NODE_ENV === 'development', // Solo en HTTPS en producción
        sameSite: 'none', // Previene ataques CSRF
        maxAge: 2 * 60 * 60 * 1000, // Expira en 2 horas
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
      });
    } catch (error) {
      // Maneja específicamente el error de credenciales
      if (error instanceof HttpException && error.getStatus() === 401) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      // Otros errores
      return res.status(500).json({
        success: false,
        message: 'Error during login',
      });
    }
  }

  @Post('/logout')
  logout(@Res() res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'strict',
      path: '/',
      domain: 'localhost', // O tu dominio en producción
    });

    // Envía una respuesta simple sin usar res.json()
    return res
      .status(200)
      .header('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          success: true,
          message: 'Logged out successfully',
        }),
      );
  }

  @Post('/register-admin')
  async registerAdmin(@Body() { username, password }) {
    return this.authService.registerAdmin(username, password);
  }

  @Post('/register-company')
  @UseGuards(JwtAuthGuard)
  // TODO: Tipar companyData
  async registerCompany(@Req() req, @Body() companyData, @Res() res: Response) {
    try {
      const company = await this.authService.registerCompany(
        req.user.username,
        companyData,
      );

      const newToken = jwt.sign(
        {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role,
          Orgnum: companyData.Orgnum,
          FsSubscriptionKey: companyData.FsSubscriptionKey,
          FsApiKey: companyData.FsApiKey,
          WooCommerceConsumerKey: companyData.WooCommerceConsumerKey,
          WooCommerceConsumerSecret: companyData.WooCommerceConsumerSecret,
          WooCommerceUrl: companyData.WooCommerceUrl,
          LegalName: companyData.LegalName,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' },
      );

      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 * 1000,
      });

      return res.status(200).json(company);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof HttpException) {
      throw error;
    } else {
      throw new HttpException(
        'Ocurrió un error inesperado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
