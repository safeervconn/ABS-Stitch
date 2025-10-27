import CryptoJS from 'crypto-js';

const MERCHANT_CODE = import.meta.env.VITE_2CO_MERCHANT_CODE;
const SECRET_KEY = import.meta.env.VITE_2CO_SECRET_KEY;
const INS_SECRET_WORD = import.meta.env.VITE_2CO_INS_SECRET_WORD;
const BUY_LINK_SECRET = import.meta.env.VITE_2CO_BUY_LINK_SECRET;

function validate2CheckoutConfig(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!MERCHANT_CODE) missing.push('VITE_2CO_MERCHANT_CODE');
  if (!BUY_LINK_SECRET) missing.push('VITE_2CO_BUY_LINK_SECRET');
  if (!INS_SECRET_WORD) missing.push('VITE_2CO_INS_SECRET_WORD');

  return {
    isValid: missing.length === 0,
    missing
  };
}

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
  console.log('=== generatePaymentLink called ===');
  console.log('Input params:', JSON.stringify(params, null, 2));

  const config = validate2CheckoutConfig();
  if (!config.isValid) {
    throw new Error(`2Checkout is not configured. Missing environment variables: ${config.missing.join(', ')}`);
  }

  const {
    invoiceId,
    amount,
    currency = 'USD',
    products,
    returnUrl,
    cancelUrl,
  } = params;

  console.log('Products received:', products);
  console.log('Products length:', products?.length);

  if (!products || products.length === 0) {
    throw new Error('At least one product is required to generate a payment link');
  }

  const baseParams: Record<string, string> = {
    merchant: MERCHANT_CODE,
    dynamic: '1',
    'return-url': returnUrl,
    'return-type': 'redirect',
    'cancel-url': cancelUrl,
    currency: currency,
    'merchant-order-id': invoiceId,
    tangible: '0',
    src: 'DYNAMIC',
  };

  products.forEach((product, index) => {
    console.log(`Adding product ${index}:`, product);
    if (!product.name || !product.name.trim()) {
      throw new Error(`Product at index ${index} must have a name`);
    }

    const suffix = index === 0 ? '' : `_${index}`;
    baseParams[`prod${suffix}`] = product.name.trim();
    baseParams[`price${suffix}`] = product.price.toFixed(2);
    baseParams[`qty${suffix}`] = product.quantity.toString();
    baseParams[`type${suffix}`] = 'PRODUCT';

    console.log(`Product ${index}: prod${suffix}=${product.name.trim()}, price${suffix}=${product.price.toFixed(2)}, qty${suffix}=${product.quantity}`);
  });

  console.log('All params before signature:', baseParams);

  const paramsArray = Object.entries(baseParams)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

  const signatureString = paramsArray
    .map(([key, value]) => {
      const serialized = `${value.length}${value}`;
      console.log(`Serializing ${key}: "${value}" -> "${serialized}"`);
      return serialized;
    })
    .join('');

  console.log('Final signature string:', signatureString);

  const signature = CryptoJS.HmacSHA256(signatureString, BUY_LINK_SECRET).toString();
  console.log('Generated signature (SHA256):', signature);

  baseParams['signature'] = signature;

  const urlParams = new URLSearchParams(baseParams);
  const finalUrl = `https://secure.2checkout.com/order/checkout.php?${urlParams.toString()}`;
  console.log('Final payment URL:', finalUrl);
  console.log('=== generatePaymentLink complete ===');

  return finalUrl;
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
