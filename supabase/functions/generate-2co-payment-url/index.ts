import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createHash } from "node:crypto";
import { corsHeaders } from "../_shared/corsHeaders.ts";

const TCO_SELLER_ID = Deno.env.get("TCO_SELLER_ID") || "";
const TCO_SECRET_WORD = Deno.env.get("TCO_SECRET_WORD") || "";

interface Product {
  name: string;
  price: number;
  quantity: number;
}

interface RequestPayload {
  invoiceId: string;
  products: Product[];
  returnUrl: string;
  cancelUrl: string;
  currency?: string;
}

function generateSignature(
  secretWord: string,
  sellerId: string,
  productName: string,
  price: string,
  type: string,
  currency: string
): string {
  const baseString = `${secretWord}${sellerId}${productName}${price}${type}${currency}`;
  return createHash("sha256").update(baseString).digest("hex");
}

function buildCheckoutUrl(params: RequestPayload): string {
  if (!TCO_SELLER_ID || !TCO_SECRET_WORD) {
    throw new Error("2Checkout credentials not configured. Please set TCO_SELLER_ID and TCO_SECRET_WORD secrets.");
  }

  const { invoiceId, products, returnUrl, cancelUrl, currency = "USD" } = params;

  if (!products || products.length === 0) {
    throw new Error("At least one product is required");
  }

  const product = products[0];
  const productName = product.name.trim();
  const price = product.price.toFixed(2);
  const quantity = product.quantity.toString();
  const type = "PRODUCT";

  const signature = generateSignature(
    TCO_SECRET_WORD,
    TCO_SELLER_ID,
    productName,
    price,
    type,
    currency
  );

  const urlParams = new URLSearchParams();
  urlParams.set("merchant", TCO_SELLER_ID);
  urlParams.set("prod", productName);
  urlParams.set("price", price);
  urlParams.set("qty", quantity);
  urlParams.set("type", type);
  urlParams.set("currency", currency);
  urlParams.set("return-url", returnUrl);
  urlParams.set("return-type", "redirect");
  urlParams.set("merchant-order-id", invoiceId);
  urlParams.set("signature", signature);

  const checkoutUrl = `https://secure.2checkout.com/order/checkout.php?${urlParams.toString()}`;

  return checkoutUrl;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const payload: RequestPayload = await req.json();

    if (!payload.invoiceId) {
      return new Response(
        JSON.stringify({ error: "invoiceId is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!payload.products || payload.products.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one product is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!payload.returnUrl || !payload.cancelUrl) {
      return new Response(
        JSON.stringify({ error: "returnUrl and cancelUrl are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const checkoutUrl = buildCheckoutUrl(payload);

    console.log("Generated 2Checkout URL for invoice:", payload.invoiceId);

    return new Response(
      JSON.stringify({ checkoutUrl }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating 2Checkout URL:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
