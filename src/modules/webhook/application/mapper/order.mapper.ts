export const transformOrderData = (woocommerceOrder: any): any => {
  // Aquí transformas los datos de WooCommerce al formato de FrontSystems
  return {
    receiptNo: woocommerceOrder.id.toString(),
    receiptFormatted: woocommerceOrder.date_created,
    receiptUrl: woocommerceOrder._links.self[0].href,
    orderNo: woocommerceOrder.number,
    createdDateTime: woocommerceOrder.date_created,
    updatedDateTime: woocommerceOrder.date_modified,
    comment: woocommerceOrder.customer_note,
    store: {
      storeExtId: 'STORE789', // Esto debería ser dinámico
      storeName: 'Example Store',
      organizationNumber: '981582019',
      posId: 1,
      posName: 'POS1',
      salesPerson: 'John Doe',
      currency: 'NOK',
      address: {
        firstName: 'Example',
        lastName: 'Store',
        companyName: 'Example AS',
        address1: 'Example Street 123',
        address2: '',
        city: 'Oslo',
        province: 'Viken',
        postalCode: '1234',
        country: 'Norway',
        countryCode: 'NO',
        comment: 'Test store address',
      },
    },
    customer: {
      email: woocommerceOrder.billing.email,
      firstName: woocommerceOrder.billing.first_name,
      lastName: woocommerceOrder.billing.last_name,
      companyName: woocommerceOrder.billing.company,
      taxId: '987654321', // Esto debería ser dinámico
      phoneCountryPrefix: '+47',
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
        countryCode: woocommerceOrder.billing.country,
        comment: 'Test customer address',
      },
    },
    paymentLines: [
      {
        type: 'creditCard',
        subType: 'visa',
        currency: woocommerceOrder.currency,
        currencyTendered: woocommerceOrder.total,
        txRef: woocommerceOrder.transaction_id,
        text: `Payment for order ${woocommerceOrder.number}`,
        amount: woocommerceOrder.total,
        discountPercent: 0.15, // Esto debería ser dinámico
        rowId: 'PAY123',
      },
    ],
    orderLines: woocommerceOrder.line_items.map((item) => ({
      quantity: item.quantity,
      gtin: '7622210360104', // Esto debería ser dinámico
      price: item.price,
      vat: item.total_tax,
      vatPercent: 0.25, // Esto debería ser dinámico
      fullPrice: item.total,
      discount: 15, // Esto debería ser dinámico
      discountPercent: 0.15, // Esto debería ser dinámico
      sizeText: 'Large', // Esto debería ser dinámico
      rowId: 'ORDL001',
      externalSKU: item.sku,
      receiptLabel: item.name,
      status: 'UnHandled',
    })),
    status: 'UnHandled',
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
  };
};
