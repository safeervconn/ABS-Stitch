// test-2co-url.js

const testGenerateUrl = async () => {
  // ⚙️ Replace with your Supabase function URL
  const endpoint = "https://iutxllhudjckcaiwabud.supabase.co/functions/v1/generate-2co-payment-url";

  // 🧾 Dummy data to simulate invoice + products
  const payload = {
    invoiceId: "test-invoice-123",
    currency: "USD",
    returnUrl: "https://example.com/payment/success",
    cancelUrl: "https://example.com/payment/failure",
    products: [
      { name: "Test Product A", price: 10.00, quantity: 2 },
      { name: "Test Product B", price: 5.50, quantity: 1 }
    ]
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("\n✅ Response from Edge Function:");
    console.log(data);

    if (data.checkoutUrl) {
      console.log("\n🧩 Generated Checkout URL:");
      console.log(data.checkoutUrl);
    } else {
      console.log("\n⚠️ No checkout URL returned. Check error details above.");
    }
  } catch (err) {
    console.error("❌ Error calling function:", err);
  }
};

testGenerateUrl();
