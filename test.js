import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// Use service role key here (NOT anon key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log("🚀 Starting seeding...");

  // --- 1. Create Users ---
  const users = [
    { email: "admin@example.com", password: "password123", role: "admin", full_name: "Super Admin" },
    { email: "sales@example.com", password: "password123", role: "sales_rep", full_name: "Sally Sales" },
    { email: "designer@example.com", password: "password123", role: "designer", full_name: "Danny Designer" },
    { email: "customer@example.com", password: "password123", role: "customer", full_name: "Charlie Customer" },
  ];

  const createdUsers = [];

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      console.error("❌ Error creating user:", u.email, error);
    } else {
      console.log("✅ Created user:", u.email);
      createdUsers.push({ ...u, id: data.user.id });
    }
  }

  // --- 2. Insert into user_profiles ---
  for (const u of createdUsers) {
    const { error } = await supabase.from("user_profiles").insert({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
    });
    if (error) console.error("❌ Error inserting profile:", u.email, error);
    else console.log("✅ Inserted profile:", u.email);
  }

  // Get IDs for convenience
  const admin = createdUsers.find(u => u.role === "admin");
  const salesRep = createdUsers.find(u => u.role === "sales_rep");
  const designer = createdUsers.find(u => u.role === "designer");
  const customer = createdUsers.find(u => u.role === "customer");

  // --- 3. Insert Products ---
  const { data: products, error: prodError } = await supabase.from("products").insert([
    {
      title: "Custom Shirt",
      description: "A stylish custom shirt",
      category: "Clothing",
      price: 25.0,
      created_by: admin.id,
    },
    {
      title: "Embroidered Jacket",
      description: "Warm and fashionable",
      category: "Clothing",
      price: 60.0,
      created_by: admin.id,
    },
  ]).select();

  if (prodError) {
    console.error("❌ Error inserting products:", prodError);
  } else {
    console.log("✅ Inserted products:", products);
  }

  // --- 4. Insert Order ---
  const { data: order, error: orderError } = await supabase.from("orders").insert({
    order_number: "ORD-001",
    customer_id: customer.id,
    sales_rep_id: salesRep.id,
    assigned_designer_id: designer.id,
    order_type: "custom",
    status: "pending",
    total_amount: 85.0,
  }).select().single();

  if (orderError) {
    console.error("❌ Error inserting order:", orderError);
  } else {
    console.log("✅ Inserted order:", order);
  }

  // --- 5. Insert Order Items ---
  if (order && products?.length) {
    const { error: itemsError } = await supabase.from("order_items").insert([
      {
        order_id: order.id,
        product_id: products[0].id,
        quantity: 1,
        unit_price: 25.0,
        total_price: 25.0,
      },
      {
        order_id: order.id,
        product_id: products[1].id,
        quantity: 1,
        unit_price: 60.0,
        total_price: 60.0,
      },
    ]);

    if (itemsError) {
      console.error("❌ Error inserting order items:", itemsError);
    } else {
      console.log("✅ Inserted order items");
    }
  }

  console.log("🎉 Seeding complete!");
}

seed();
