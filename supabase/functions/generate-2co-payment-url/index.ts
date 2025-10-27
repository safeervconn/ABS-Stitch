import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/corsHeaders.ts";
import { generatePaymentLink, type Product } from "../_shared/twoCheckoutHelpers.ts";

const TCO_SELLER_ID = Deno.env.get("TCO_SELLER_ID") || "";
const TCO_SECRET_WORD = Deno.env.get("TCO_SECRET_WORD") || "";

interface RequestPayload {
  invoiceId: string;
  products: Product[];
  returnUrl: string;
  cancelUrl: string;
  currency?: string;
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

    const { url, debugInfo } = generatePaymentLink(
      {
        invoiceId: payload.invoiceId,
        products: payload.products,
        currency: payload.currency || "USD",
        returnUrl: payload.returnUrl,
        cancelUrl: payload.cancelUrl,
      },
      TCO_SELLER_ID,
      TCO_SECRET_WORD
    );

    console.log("=== 2Checkout Payment URL Generated ===");
    console.log("Invoice ID:", debugInfo.invoiceId);
    console.log("Products:", JSON.stringify(debugInfo.products, null, 2));
    console.log("Currency:", debugInfo.currency);
    console.log("Total:", debugInfo.total);
    console.log("Seller ID:", debugInfo.sellerId);
    console.log("String to Sign:", debugInfo.toSign);
    console.log("Generated Signature:", debugInfo.signature);
    console.log("Final URL:", url);
    console.log("=== End Debug Info ===");

    return new Response(
      JSON.stringify({ checkoutUrl: url }),
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