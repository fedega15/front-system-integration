import { Controller, Post, Body, Request, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('wc-webhooks')
@UseGuards(JwtAuthGuard)
export class WooCommerceWebhookController {
  constructor() {}

  // @Post('/order-created')
  // async handleOrderCreated(
  //   @Body() payload: any,
  //   @Req() req: Request,
  // ): Promise<any> {
  //   try {
  //     // await this.syncOrderService.handleOrderCreated(payload);
  //     await this.webhookService.processWooCommerceWebhook(
  //       payload,
  //       req['tenant'],
  //     );
  //     return {
  //       success: true,
  //       message: 'Order processed successfully',
  //     };
  //   } catch (error) {
  //     console.error('Error processing order:', error);
  //     return {
  //       success: false,
  //       message: 'Error processing order',
  //       error: error.message,
  //     };
  //   }
  // }

  // En WebhooksController
  // @Post('front-systems')
  // async handleFrontSystemsWebhook(@Body() body: any): Promise<string> {
  //   const { event, payload } = body;

  //   // switch (event) {
  //   //   case 'StockMovementCreated':
  //   //     await this.webhooksService.handleStockUpdate(
  //   //       payload.productId,
  //   //       payload.stock,
  //   //     );
  //   //     break;
  //   //   // case 'SaleCreated':
  //   //   //   await this.webhooksService.handleOrderCreated(payload);
  //   //   //   break;
  //   //   default:
  //   //     console.warn(`Evento no manejado: ${event}`);
  //   // }

  //   return 'Webhook recibido correctamente';
  // }
}
