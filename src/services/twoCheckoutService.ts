import CryptoJS from 'crypto-js';

const MERCHANT_CODE = import.meta.env.VITE_2CO_MERCHANT_CODE;
const SECRET_KEY = import.meta.env.VITE_2CO_SECRET_KEY;
const INS_SECRET_WORD = import.meta.env.VITE_2CO_INS_SECRET_WORD;
const BUY_LINK_SECRET = import.meta.env.VITE_2CO_BUY_LINK_SECRET;

export interface PaymentLinkParams {
  invoiceId: string;
  amount: number;
  currency?: string;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface WebhookPayload {
  REFNO: string;
  ORDERNO: string;
  ORDERSTATUS: string;
  PAYMENTAMOUNT: string;
  PAYMENTCURRENCY: string;
  PAYMENTMETHOD: string;
  HASH: string;
  [key: string]: string;
}

export function generatePaymentLink(params: PaymentLinkParams): string {
  const {
    invoiceId,
    amount,
    currency = 'USD',
    products,
    returnUrl,
    cancelUrl,
  } = params;

  if (!products || products.length === 0) {
    throw new Error('At least one product is required to generate a payment link');
  }

  const urlParams = new URLSearchParams({
    merchant: MERCHANT_CODE,
    dynamic: '1',
    'return-url': returnUrl,
    'return-type': 'redirect',
    'cancel-url': cancelUrl,
    currency: currency,
    'merchant-order-id': invoiceId,
    tangible: '0',
  });

  products.forEach((product, index) => {
    if (!product.name || !product.name.trim()) {
      throw new Error(`Product at index ${index} must have a name`);
    }
    urlParams.append(`prod[${index}]`, product.name);
    urlParams.append(`price[${index}]`, product.price.toFixed(2));
    urlParams.append(`qty[${index}]`, product.quantity.toString());
  });

  const paramsForSignature = Array.from(urlParams.entries())
    .filter(([key]) => key !== 'signature')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}${value}`)
    .join('');

  const signature = CryptoJS.HmacMD5(paramsForSignature, BUY_LINK_SECRET).toString();
  urlParams.append('signature', signature);

  return `https://secure.2checkout.com/order/checkout.php?${urlParams.toString()}`;
}

export function verifyINSSignature(payload: WebhookPayload): boolean {
  try {
    const receivedHash = payload.HASH;
    delete payload.HASH;

    const keys = Object.keys(payload).sort();
    let signatureString = '';

    for (const key of keys) {
      const value = payload[key];
      signatureString += `${value.length}${value}`;
    }

    const calculatedHash = CryptoJS.MD5(signatureString + INS_SECRET_WORD).toString();

    return calculatedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying INS signature:', error);
    return false;
  }
}

export function parseWebhookPayload(formData: FormData): WebhookPayload {
  const payload: WebhookPayload = {
    REFNO: '',
    ORDERNO: '',
    ORDERSTATUS: '',
    PAYMENTAMOUNT: '',
    PAYMENTCURRENCY: '',
    PAYMENTMETHOD: '',
    HASH: '',
  };

  for (const [key, value] of formData.entries()) {
    payload[key] = value.toString();
  }

  return payload;
}

export interface PaymentMetadata {
  invoiceId: string;
  orderIds: string[];
}

export function encodePaymentMetadata(metadata: PaymentMetadata): string {
  return btoa(JSON.stringify(metadata));
}

export function decodePaymentMetadata(encoded: string): PaymentMetadata | null {
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function isPaymentSuccessful(orderStatus: string): boolean {
  const successStatuses = ['COMPLETE', 'AUTHRECEIVED', 'PAYMENT_AUTHORIZED'];
  return successStatuses.includes(orderStatus.toUpperCase());
}

export function isPaymentPending(orderStatus: string): boolean {
  const pendingStatuses = ['PENDING', 'PENDING_APPROVAL', 'PAYMENT_RECEIVED'];
  return pendingStatuses.includes(orderStatus.toUpperCase());
}

export function isPaymentFailed(orderStatus: string): boolean {
  const failedStatuses = ['CANCELED', 'REFUND', 'REVERSED', 'FRAUD'];
  return failedStatuses.includes(orderStatus.toUpperCase());
}
