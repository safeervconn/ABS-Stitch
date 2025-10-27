import CryptoJS from "npm:crypto-js@4.2.0";

export interface Product {
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentLinkParams {
  invoiceId: string;
  products: Product[];
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}

export function generatePaymentLink(
  params: PaymentLinkParams,
  sellerId: string,
  secretWord: string
): { url: string; debugInfo: Record<string, unknown> } {
  if (!sellerId || !secretWord) {
    throw new Error("2Checkout credentials not configured");
  }

  const { invoiceId, products, currency, returnUrl, cancelUrl } = params;

  if (!products || products.length === 0) {
    throw new Error("At least one product is required");
  }

  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  ).toFixed(2);

  const toSign = `${secretWord}${sellerId}${currency}${total}`;
  const signature = CryptoJS.SHA256(toSign).toString();

  const baseParams: Record<string, string> = {
    merchant: sellerId,
    dynamic: "1",
    src: "DYNAMIC",
    currency: currency,
    "return-url": returnUrl,
    "return-type": "redirect",
    "cancel-url": cancelUrl,
    "merchant-order-id": invoiceId,
    signature: signature,
  };

  products.forEach((product, index) => {
    if (!product.name || !product.name.trim()) {
      throw new Error(`Product at index ${index} must have a name`);
    }

    const suffix = index === 0 ? "" : `_${index}`;
    baseParams[`prod${suffix}`] = product.name.trim();
    baseParams[`price${suffix}`] = product.price.toFixed(2);
    baseParams[`qty${suffix}`] = product.quantity.toString();
    baseParams[`type${suffix}`] = "PRODUCT";
  });

  const urlParams = new URLSearchParams(baseParams);
  const checkoutUrl = `https://secure.2checkout.com/order/checkout.php?${urlParams.toString()}`;

  return {
    url: checkoutUrl,
    debugInfo: {
      invoiceId,
      products,
      currency,
      total,
      toSign,
      signature,
      sellerId,
    },
  };
}

export function verifyINSSignature(
  payload: Record<string, string>,
  insSecretWord: string
): boolean {
  try {
    const receivedHash = payload.HASH;
    if (!receivedHash) {
      return false;
    }

    const payloadCopy = { ...payload };
    delete payloadCopy.HASH;

    const keys = Object.keys(payloadCopy).sort();
    let signatureString = "";

    for (const key of keys) {
      const value = payloadCopy[key] || "";
      signatureString += `${value.length}${value}`;
    }

    const calculatedHash = CryptoJS.MD5(signatureString + insSecretWord).toString();

    return calculatedHash === receivedHash;
  } catch (error) {
    console.error("Error verifying INS signature:", error);
    return false;
  }
}