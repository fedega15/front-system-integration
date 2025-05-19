import { FSStoreDto } from '@/modules/front-systems/store/application/dto';
import { WooCommerceOrderDto } from '../dto';
import { FrontSystemsOrderDto } from '@/modules/front-systems/order/application/dto';
import { IStockQty } from '@/modules/webhook/application/interface/stock.interface';

export function mapWooCommerceOrderToFrontSystems(
  woocommerceOrder: WooCommerceOrderDto,
  stockId: number,
  store: FSStoreDto,
  productsWithGtinAndStock: Array<{
    productId: number;
    gtin: string;
    stockQty: IStockQty[];
    stockIds: number[];
    identity: number;
  }>,
): FrontSystemsOrderDto {
  // Calculate total for the products in this store
  const totalForStore = productsWithGtinAndStock.reduce((sum, product) => {
    const orderItem = woocommerceOrder.line_items.find(
      (item) => item.product_id === product.productId,
    );
    if (orderItem) {
      return sum + parseFloat(orderItem.total);
    }
    return sum;
  }, 0);

  const totalTaxForStore = productsWithGtinAndStock.reduce((sum, product) => {
    const orderItem = woocommerceOrder.line_items.find(
      (item) => item.product_id === product.productId,
    );
    if (orderItem) {
      return sum + parseFloat(orderItem.total_tax);
    }
    return sum;
  }, 0);

  const frontSystemsOrder: FrontSystemsOrderDto = {
    orderId: woocommerceOrder.id,
    orderType: 'Unknown',
    dueDateTime: woocommerceOrder.date_created,
    expirationDateTime: woocommerceOrder.date_created,
    receiptNo: `${woocommerceOrder.id}-${stockId}`, // Add stockId to receipt number for uniqueness
    receiptFormatted: woocommerceOrder.date_created,
    receiptUrl: woocommerceOrder._links.self[0].href,
    orderNo: `${woocommerceOrder.number}-${stockId}`, // Add stockId to order number for uniqueness
    createdDateTime: woocommerceOrder.date_created,
    updatedDateTime: woocommerceOrder.date_modified,
    comment: `${woocommerceOrder.customer_note || ''} (Partial order from store ${store.StoreName})`,
    store: {
      storeExtId: `${store.StoreId}`,
      storeName: store.StoreName,
      posId: 0,
      address: {
        address1: store.Address,
        city: store.City,
        postalCode: store.PostalCode,
      },
    },
    customer: {
      email: woocommerceOrder.billing.email,
      firstName: woocommerceOrder.billing.first_name,
      lastName: woocommerceOrder.billing.last_name,
      companyName: woocommerceOrder.billing.company,
      taxId: '',
      phoneCountryPrefix:
        woocommerceOrder.billing.phone.match(/^\+\d+/)?.[0] || '',
      phone: woocommerceOrder.billing.phone,
      address: {
        firstName: woocommerceOrder.billing.first_name,
        lastName: woocommerceOrder.billing.last_name,
        companyName: woocommerceOrder.billing.company,
        address1: woocommerceOrder.billing.address_1,
        address2: woocommerceOrder.billing.address_2,
        city: woocommerceOrder.billing.city,
        province: woocommerceOrder.billing.state,
        postalCode: woocommerceOrder.billing.postcode,
        country: woocommerceOrder.billing.country,
        countryCode: '',
        comment: woocommerceOrder.customer_note,
      },
    },
    paymentLines: [
      {
        type: woocommerceOrder.payment_method,
        subType: woocommerceOrder.payment_method_title,
        currency: woocommerceOrder.currency,
        currencyTendered: totalForStore,
        txRef: woocommerceOrder.transaction_id,
        text: `Partial payment for order ${woocommerceOrder.number} from store ${store.StoreName}`,
        amount: totalForStore,
        rowId: '',
      },
    ],
    orderLines: productsWithGtinAndStock.map((product) => {
      const orderItem = woocommerceOrder.line_items.find(
        (item) => item.product_id === product.productId,
      );
      // Buscar el stock físico para este producto
      const stockWithQty = product.stockQty?.find(sq => sq.stockId !== stockId && sq.qty > 0);
      const stockIdFisica = stockWithQty ? stockWithQty.stockId : stockId;
      return {
        quantity: orderItem?.quantity || 0,
        gtin: product.gtin,
        price: parseFloat(orderItem?.price || '0'),
        vat: parseFloat(orderItem?.total_tax || '0'),
        vatPercent: 0,
        fullPrice: parseFloat(orderItem?.total || '0'),
        discount: 0,
        discountPercent: 0,
        sizeText: '',
        rowId: '',
        externalSKU: '',
        receiptLabel: orderItem?.name || '',
        status: 'UnHandled',
        shipFromOnlineStore: false,
        stockId: stockIdFisica, // Propaga el stock físico
      };
    }),
    orderEvents: [],
    status: 'UnHandled',
    reservationLengthInHours: 0,
    fulfillmentLocation: {
      stockId: stockId,
      stockName: store.StoreName,
      posId: 1,
      personId: 1,
      deliveryAddress: {
        firstName: woocommerceOrder.shipping.first_name,
        lastName: woocommerceOrder.shipping.last_name,
        companyName: woocommerceOrder.shipping.company,
        address1: woocommerceOrder.shipping.address_1,
        address2: woocommerceOrder.shipping.address_2,
        city: woocommerceOrder.shipping.city,
        province: woocommerceOrder.shipping.state,
        postalCode: woocommerceOrder.shipping.postcode,
        country: woocommerceOrder.shipping.country,
        countryCode: woocommerceOrder.shipping.country,
        comment: '',
      },
      shipmentInfo: [`Partial order from store ${store.StoreName}`],
      shipments: [],
    },
    shipmentInfo: `Partial order from store ${store.StoreName}`,
    shippingAddress: {
      firstName: woocommerceOrder.shipping.first_name,
      lastName: woocommerceOrder.shipping.last_name,
      companyName: woocommerceOrder.shipping.company,
      address1: woocommerceOrder.shipping.address_1,
      address2: woocommerceOrder.shipping.address_2,
      city: woocommerceOrder.shipping.city,
      province: woocommerceOrder.shipping.state,
      postalCode: woocommerceOrder.shipping.postcode,
      country: woocommerceOrder.shipping.country,
      countryCode: woocommerceOrder.shipping.country,
      comment: '',
    },
    vatTotal: totalTaxForStore,
    total: totalForStore,
  };

  // --- RECOMMENDED SALES LINES FLOW (Front Systems) ---
  // Only one salesLine per product: stockId = physical store, qty = -N, price = real
  // x-storeId header must be set to the Webshop storeId
  // 'identity' is required by Front Systems and must be included in each salesLine
  const salesLines = productsWithGtinAndStock.map((product) => {
    const orderItem = woocommerceOrder.line_items.find(
      (item) => item.product_id === product.productId,
    );
    const qty = orderItem?.quantity || 0;
    const price = parseFloat(orderItem?.price || '0');
    const vat = orderItem ? parseFloat(orderItem.total_tax) / parseFloat(orderItem.price || '1') : 0;

    // Find the physical stockId (not the webshop)
    const stockWithQty = product.stockQty?.find(sq => sq.stockId !== stockId && sq.qty > 0);
    const stockIdFisica = stockWithQty ? stockWithQty.stockId : stockId;

    return {
      identity: product.identity, // Always use the identity field
      text: orderItem?.name || '',
      price: price,
      qty: qty,
      stockId: stockIdFisica,
      vat,
    };
  });

  return frontSystemsOrder;
}
