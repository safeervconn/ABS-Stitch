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

/**
 * Generates a 2Checkout ConvertPlus payment link with proper HMAC-SHA256 signature
 * Following the official Verifone documentation for dynamic products
 */
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

  // Build product parameter arrays (semicolon-separated for multiple products)
  const prodNames: string[] = [];
  const prices: string[] = [];
  const quantities: string[] = [];
  const types: string[] = [];

  products.forEach((product) => {
    if (!product.name || !product.name.trim()) {
      throw new Error("Product must have a name");
    }
    prodNames.push(product.name.trim());
    prices.push(product.price.toFixed(2));
    quantities.push(product.quantity.toString());
    types.push("PRODUCT");
  });

  // Join arrays with semicolon for multiple products
  const prodValue = prodNames.join(";");
  const priceValue = prices.join(";");
  const qtyValue = quantities.join(";");
  const typeValue = types.join(";");

  // Build base parameters (these go in URL but not all in signature)
  const baseParams: Record<string, string> = {
    merchant: sellerId,
    dynamic: "1",
    currency: currency,
    prod: prodValue,
    price: priceValue,
    qty: qtyValue,
    type: typeValue,
    "return-url": returnUrl,
    "return-type": "redirect",
    "merchant-order-id": invoiceId,
  };

  // Parameters that MUST be included in signature (alphabetically sorted)
  // Per ConvertPlus documentation: currency, prod, price, qty, type
  const signatureParams: Record<string, string> = {
    currency: currency,
    price: priceValue,
    prod: prodValue,
    qty: qtyValue,
    type: typeValue,
  };

  // Sort parameters alphabetically
  const sortedKeys = Object.keys(signatureParams).sort();

  // Serialize with length prefix (e.g., "3USD" for "USD")
  const serializedParts: string[] = [];
  sortedKeys.forEach((key) => {
    const value = signatureParams[key];
    const length = new TextEncoder().encode(value).length; // UTF-8 byte length
    serializedParts.push(`${length}${value}`);
  });

  const serializedString = serializedParts.join("");

  // Generate HMAC-SHA256 signature
  const signature = CryptoJS.HmacSHA256(serializedString, secretWord).toString();

  // Add signature to parameters
  baseParams.signature = signature;

  // Build final URL
  const urlParams = new URLSearchParams(baseParams);
  const checkoutUrl = `https://secure.2checkout.com/checkout/buy?${urlParams.toString()}`;

  // Calculate total for debug info
  const total = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  ).toFixed(2);

  return {
    url: checkoutUrl,
    debugInfo: {
      invoiceId,
      products,
      currency,
      total,
      sellerId,
      signatureParams,
      sortedKeys,
      serializedString,
      signature,
      finalParams: baseParams,
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