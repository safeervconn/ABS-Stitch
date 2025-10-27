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
  merchantCode: string,
  buyLinkSecret: string
): { url: string; debugInfo: Record<string, unknown> } {
  if (!merchantCode || !buyLinkSecret) {
    throw new Error("2Checkout credentials not configured");
  }

  const { invoiceId, products, currency, returnUrl, cancelUrl } = params;

  if (!products || products.length === 0) {
    throw new Error("At least one product is required");
  }

  const baseParams: Record<string, string> = {
    merchant: merchantCode,
    dynamic: "1",
    "return-url": returnUrl,
    "return-type": "redirect",
    "cancel-url": cancelUrl,
    currency: currency,
    "merchant-order-id": invoiceId,
    tangible: "0",
    src: "DYNAMIC",
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

  const paramsArray = Object.entries(baseParams).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB)
  );

  const signatureString = paramsArray
    .map(([_, value]) => `${value.length}${value}`)
    .join("");

  const signature = CryptoJS.HmacSHA256(signatureString, buyLinkSecret).toString();

  baseParams["signature"] = signature;

  const urlParams = new URLSearchParams(baseParams);
  const checkoutUrl = `https://secure.2checkout.com/order/checkout.php?${urlParams.toString()}`;

  return {
    url: checkoutUrl,
    debugInfo: {
      invoiceId,
      products,
      sortedParams: paramsArray.map(([k, v]) => ({ key: k, value: v })),
      signatureString,
      signature,
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
