export default () => ({
  server: {
    port: Number(process.env.PORT),
    node_env: process.env.NODE_ENV,
  },
  frontsystems: {
    subscription_key: process.env.FRONT_SYSTEMS_SUBSCRIPTION_KEY,
    api_key: process.env.FRONT_SYSTEMS_API_KEY,
    apiUrl: process.env.FRONT_SYSTEMS_API_URL,
  },
  woocommerce: {
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
    apiUrl: process.env.WOOCOMMERCE_API_URL,
  },
});
