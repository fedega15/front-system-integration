import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthService } from '@/modules/auth/application/service/auth.service';
import { SalesReportingService } from '@/modules/front-systems/sales-reporting/application/service/sales-reporting.service';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';
import { ImportRecordService } from '@/modules/sync/application/service/import-history.service';
import { FsStoreService } from '@/modules/front-systems/store/application/service/store.service';
import { Request } from 'express';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';
import { SensitiveData } from '@/modules/auth/application/types/auth-interfaces';
import { AuthRepository } from '@/modules/auth/infrastructure/persistance/auth.repository';

// Define an interface for the user object after JWT authentication
interface AuthenticatedUser extends User {
  userId: string;
  apiKeys: SensitiveData;
}

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly salesReportingService: SalesReportingService,
    private readonly wcProductService: WCProductService,
    private readonly importRecordService: ImportRecordService,
    private readonly fsStoreService: FsStoreService,
    private readonly authRepository: AuthRepository,
  ) {}

  @Get('/data')
  async getDashboardData(@Req() req: Request & { user: AuthenticatedUser }) {
    const user = req.user;

    if (!user) {
      this.logger.error('No user found in request');
      // Depending on your auth guard, this might not be reachable, but good for safety
      return { error: 'User not authenticated' };
    }

    try {
      if (user.role === 'admin') {
        // Fetch only company counts for admin
        const [totalCompanies, activeCompanies] = await Promise.all([
          this.authRepository.countCompanyUsers(),
          this.authRepository.countActiveCompanyUsers(),
        ]);

        return {
          totalCompanies,
          activeCompanies,
        };
      } else {
        // Fetch all data for non-admin users
        const [salesReport, products, importRecords, stores] = await Promise.all([
          // Fetch sales reporting data
          this.salesReportingService.getSalesReport(user),

          // Fetch products from WooCommerce
          this.wcProductService.getProducts(user.apiKeys.wooCommerce),

          // Fetch import records
          this.importRecordService.getImportRecords(user.userId, user.Orgnum),

          // Fetch stores
          this.fsStoreService.getStores(user),
        ]);

        return {
          profile: {
            id: user._id,
            username: user.username,
            role: user.role,
            Orgnum: user.Orgnum,
            LegalName: user.LegalName,
            hasApiKeys: !!user.apiKeys,
            hasWooCommerce: !!user.apiKeys?.wooCommerce,
            hasFrontSystem: !!user.apiKeys?.frontSystem
          },
          salesReport,
          products,
          importRecords,
          stores,
        };
      }
    } catch (error) {
      this.logger.error('Error fetching dashboard data:', error);
      // Handle specific errors or return a generic error
      return { error: 'Failed to load dashboard data' };
    }
  }
} 