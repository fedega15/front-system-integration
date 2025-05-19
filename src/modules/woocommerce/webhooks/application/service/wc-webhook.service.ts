import { Injectable, Logger } from '@nestjs/common';
import { WooCommerceOrderDto } from '../dto';
import { WcOrderRepository } from '../../infrastructure/persistance/wc-order.repository';
import { WCProductService } from '@/modules/woocommerce/product/application/service/product.service';
import { extractGtinAndStock } from '../utils/extractGtinAndStock';
import { FsStoreService } from '@/modules/front-systems/store/application/service/store.service';
import { WcProductRepository } from '../../infrastructure/persistance/wc-product.repository';
import { mapWooCommerceOrderToFrontSystems } from '../utils/mapOrderToFrontSystems';
import { FsOrderService } from '@/modules/front-systems/order/application/service/fs-order.service';
import { WooCommerceCredentials } from '@/modules/woocommerce/application/service/woocommerce-base.service';
import { User } from '@/modules/auth/infrastructure/schemas/user.schema';

@Injectable()
export class WooCommerceWebhookService {
  private readonly logger = new Logger(WooCommerceWebhookService.name);

  constructor(
    private readonly wcProductService: WCProductService,
    private readonly fsStoreService: FsStoreService,
    private readonly fsOrderService: FsOrderService,
    private wcOrderRepository: WcOrderRepository,
    private wcProductRepository: WcProductRepository,
  ) {}

  async handleOrderCreated(
    payload: WooCommerceOrderDto,
    user: User,
  ): Promise<any> {
    if (!payload.id) {
      this.logger.warn('Payload does not contain an order ID. Skipping...');
      return {
        status: 'skipped',
        message: 'Payload does not contain an order ID',
      };
    }

    // Validar credenciales de WooCommerce
    if (
      !user.WooCommerceConsumerKey ||
      !user.WooCommerceConsumerSecret ||
      !user.WooCommerceUrl
    ) {
      this.logger.error('Credenciales de WooCommerce incompletas');
      throw new Error('Credenciales de WooCommerce incompletas');
    }

    const credentials: WooCommerceCredentials = {
      consumerKey: user.WooCommerceConsumerKey,
      consumerSecret: user.WooCommerceConsumerSecret,
      url: user.WooCommerceUrl,
    };

    const existingOrder = await this.wcOrderRepository.findOne(payload.id);

    if (existingOrder) {
      this.logger.warn(
        `Order with ID ${payload.id} already exists. Skipping...`,
      );
      return { status: 'skipped', message: 'Order already exists' };
    }

    try {
      const createdOrder = await this.wcOrderRepository.create(payload);
      this.logger.debug(
        `Order created successfully. Order id: ${createdOrder.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error creating order: ${error instanceof Error ? error.message : error}`,
      );
      return { status: 'error', message: 'Error creating order' };
    }

    const wooCommerceProductsId = [
      ...new Set(payload.line_items.map((order) => order.product_id)),
    ];

    const wooCommerceProducts = await Promise.all(
      wooCommerceProductsId.map(async (id) => {
        try {
          const existingProduct = await this.wcProductRepository.findOne(id);
          if (existingProduct) {
            this.logger.debug(
              `Product with ID ${id} found in DB. Skipping WooCommerce API call.`,
            );
            return existingProduct;
          } else {
            this.logger.debug(
              `Product with ID ${id} not found in DB. Fetching from WooCommerce...`,
            );

            const retrievedProduct =
              await this.wcProductService.retrieveProduct(id, credentials);

            await this.wcProductRepository.create(retrievedProduct);
            this.logger.debug(
              `Product with ID ${id} created successfully in DB.`,
            );
            return retrievedProduct;
          }
        } catch (error) {
          this.logger.error(
            `Error retrieving or creating product with ID ${id}:`,
            error,
          );
          return null;
        }
      }),
    ).then((products) => products.filter(Boolean));

    // traer el identity en vez de gtin

    const productsWithGtinAndStock = wooCommerceProducts.map((product) => {
      const gtinAndStock = extractGtinAndStock(product);
      return {
        productId: product.id,
        gtin: gtinAndStock?.gtin || 'N/A',
        stockQty: gtinAndStock?.stockQty,
        stockIds: gtinAndStock?.stocksIds,
        identity: gtinAndStock?.identity,
      };
    });

    let maxStock;
    let store;
    // 4) Traer información del Store

    for (const product of productsWithGtinAndStock) {
      if (product.stockQty && product.stockQty.length > 0) {
        // Encontrar el stock con la mayor cantidad
        maxStock = product.stockQty.reduce((prev, current) =>
          prev.qty > current.qty ? prev : current,
        );

        // Buscar el store en la base de datos
        store = await this.fsStoreService.getStoreByStockId(
          user,
          maxStock.stockId,
        );

        if (!store) {
          // Si no existe en la base de datos, llamar a FrontSystems para obtenerlo
          this.logger.debug(
            `Store with stockId ${maxStock.stockId} not found in DB. Fetching from FrontSystems...`,
          );
          await this.fsStoreService.syncStoresAndStocks(user); // Sincroniza stores desde FrontSystems
          store = await this.fsStoreService.getStoreByStockId(
            user,
            maxStock.stockId,
          ); // Intenta nuevamente
        }

        if (store) {
          this.logger.debug(
            `Store found for stockId ${maxStock.stockId}:`,
            store,
          );
          // Aquí puedes usar la información del store para mapear la orden de Woo a FS
        } else {
          this.logger.warn(
            `Store not found for stockId ${maxStock.stockId} after syncing with FrontSystems.`,
          );
        }
      }
    }
    // 5) Mapear la orden de Woo a Fs pasandole el o los storeIds, y la metada.

    const orderMapped = mapWooCommerceOrderToFrontSystems(
      payload,
      maxStock.stockId,
      store,
      productsWithGtinAndStock,
    );

    // 6) Crear la orden en FS.

    // const fsOrderCreated = await this.fsOrderService.createOrder(
    //   user,
    //   orderMapped,
    //   maxStock.stockId,
    // );

    // 7) Actualizar el stock en FS?
    // 8) Guardar la orden de FS en la db.

    // Aquí puedes agregar la lógica para manejar el evento
    // Por ejemplo, actualizar tu base de datos o enviar una notificación

    return { status: 'success' };
  }

  // async createWebhooks(
  //   @Body() createWebhookData: WCCreateWebhookDto,
  // ): Promise<any> {
  //   const response =
  //     await this.woocommerceHttpClientService.post<WCCreateWebhookDto>(
  //       `/webhooks`,
  //       {
  //         name: 'Create Order',
  //         topic: 'order.created',
  //         delivery_url:
  //           'https://9e08-2800-810-547-86f4-68d0-efb3-eb16-f263.ngrok-free.app/',
  //       },
  //     );
  //   return response;
  // }

  //   async subscribeToWebhooks(webhookUrl: string): Promise<any> {
  //     const response = await this.woocommerceHttpClientService.post(`/Webhooks`, {
  //       event: 'StockMovementCreated',
  //       url: webhookUrl,
  //     });
  //     return response;
  //   }
}
