export const FSwebhooksToSubscribe = [
  {
    event: 'SaleCreated',
    url: 'https://tuservidor.com/webhooks/frontsystems/sale-created',
  },
  {
    event: 'StockMovementCreated',
    url: 'https://tuservidor.com/webhooks/frontsystems/stock-movement-created',
  },
];

export const webhooksToSetup = [
  { topic: 'order.created', description: 'Handle new orders' },
];
