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
    types.push("digital");
  });

  // Join arrays with semicolon for multiple products (UNENCODED)
  const prodValue = prodNames.join(";");
  const priceValue = prices.join(";");
  const qtyValue = quantities.join(";");
  const typeValue = types.join(";");

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

  // Manually build query string to avoid double-encoding semicolons
  // CRITICAL: Do NOT use URLSearchParams as it encodes semicolons as %3B
  const queryParts: string[] = [];

  // Add parameters in specific order for consistency
  queryParts.push(`merchant=${encodeURIComponent(sellerId)}`);
  queryParts.push(`currency=${encodeURIComponent(currency)}`);
  queryParts.push(`tpl=default`); // Required for ConvertPlus
  queryParts.push(`dynamic=1`);

  // Product parameters - encode product names but keep semicolons unencoded
  queryParts.push(`prod=${prodNames.map(n => encodeURIComponent(n)).join(";")}`);
  queryParts.push(`price=${priceValue}`); // Already numeric, no encoding needed
  queryParts.push(`type=${typeValue}`); // Already lowercase "digital", no encoding needed
  queryParts.push(`qty=${qtyValue}`); // Already numeric, no encoding needed

  // Add return/cancel URLs - these need full URL encoding
  queryParts.push(`return-url=${encodeURIComponent(returnUrl)}`);
  queryParts.push(`return-type=redirect`);
  queryParts.push(`cancel-url=${encodeURIComponent(cancelUrl)}`);
  queryParts.push(`merchant-order-id=${encodeURIComponent(invoiceId)}`);

  // Add signature last
  queryParts.push(`signature=${signature}`);

  const checkoutUrl = `https://secure.2checkout.com/checkout/buy?${queryParts.join("&")}`;

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
      queryParts,
      finalUrl: checkoutUrl,
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