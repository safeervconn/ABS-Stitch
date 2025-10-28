export interface PaymentGatewayConfig {
  name: string;
  enabled: boolean;
  merchantCode?: string;
  secretKey?: string;
  apiUrl?: string;
}

export interface PaymentConfig {
  defaultGateway: string;
  gateways: {
    twoCheckout: PaymentGatewayConfig;
    stripe?: PaymentGatewayConfig;
    paypal?: PaymentGatewayConfig;
  };
}

export const paymentConfig: PaymentConfig = {
  defaultGateway: import.meta.env.VITE_DEFAULT_PAYMENT_GATEWAY || 'twoCheckout',
  gateways: {
    twoCheckout: {
      name: '2Checkout',
      enabled: import.meta.env.VITE_2CO_ENABLED !== 'false',
      merchantCode: import.meta.env.VITE_2CO_MERCHANT_CODE,
      secretKey: import.meta.env.VITE_2CO_SECRET_KEY,
      apiUrl: import.meta.env.VITE_2CO_API_URL,
    },
    stripe: {
      name: 'Stripe',
      enabled: import.meta.env.VITE_STRIPE_ENABLED === 'true',
    },
    paypal: {
      name: 'PayPal',
      enabled: import.meta.env.VITE_PAYPAL_ENABLED === 'true',
    },
  },
};

export const getActiveGateway = () => {
  const gateway = paymentConfig.gateways[paymentConfig.defaultGateway as keyof typeof paymentConfig.gateways];
  if (gateway && gateway.enabled) {
    return gateway;
  }
  return paymentConfig.gateways.twoCheckout;
};
