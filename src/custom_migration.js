

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'


async function seed() {
  try {
    // --- 1. Create Users in Auth ---
    const roles = [
      { email: 'admin@example.com', password: 'secret123', role: 'admin', full_name: 'Alice Admin' },
      { email: 'sales@example.com', password: 'secret123', role: 'sales_rep', full_name: 'Bob Sales' },
      { email: 'designer@example.com', password: 'secret123', role: 'designer', full_name: 'Charlie Designer' },
      { email: 'customer@example.com', password: 'secret123', role: 'customer', full_name: 'Diana Customer' }
    ]

    const userIds: Record<string, string> = {}

    for (const r of roles) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: r.email,
        password: r.password,
        email_confirm: true,
        user_metadata: { full_name: r.full_name, role: r.role }
      })

      if (error) {
        console.error(`Error creating ${r.role}:`, error.message)
      } else {
        console.log(`✅ Created ${r.role} user: ${r.email}`)
        userIds[r.role] = data.user.id
      }
    }

    // --- 2. Insert into user_profiles ---
    for (const r of roles) {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: userIds[r.role],
          email: r.email,
          full_name: r.full_name,
          role: r.role,
          avatar_url: null,
          phone: null
        })

      if (error) console.error(`user_profiles insert error (${r.role}):`, error.message)
    }

    // --- 3. Insert Customers, Sales Rep, Designer ---
    await supabase.from('customers').insert([
      {
        id: userIds['customer'],
        company_name: 'Acme Corp',
        billing_address: { street: '123 Main St', city: 'Springfield' },
        assigned_sales_rep: userIds['sales_rep'],
        total_orders: 0,
        total_spent: 0
      }
    ])

    await supabase.from('sales_reps').insert([
      { id: userIds['sales_rep'], employee_id: 'SR001', commission_rate: 10.0, total_sales: 0 }
    ])

    await supabase.from('designers').insert([
      { id: userIds['designer'], employee_id: 'DS001', specialties: ['Embroidery'], hourly_rate: 50.0 }
    ])

    // --- 4. Insert Products ---
    const { data: products, error: productError } = await supabase
      .from('products')
      .insert([
        {
          id: uuidv4(),
          title: 'Custom T-Shirt',
          description: 'High-quality cotton t-shirt',
          category: 'Clothing',
          price: 20.0,
          created_by: userIds['admin']
        },
        {
          id: uuidv4(),
          title: 'Embroidered Jacket',
          description: 'Stylish jacket with embroidery',
          category: 'Clothing',
          price: 80.0,
          created_by: userIds['admin']
        }
      ])
      .select()

    if (productError) console.error('Product insert error:', productError.message)

    // --- 5. Create Order ---
    const orderId = uuidv4()
    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      order_number: 'ORD001',
      customer_id: userIds['customer'],
      sales_rep_id: userIds['sales_rep'],
      assigned_designer_id: userIds['designer'],
      order_type: 'custom',
      status: 'pending',
      total_amount: 100.0,
      custom_instructions: 'Use blue thread for embroidery',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
    })

    if (orderError) console.error('Order insert error:', orderError.message)

    // --- 6. Add Order Items ---
    if (products && products.length > 0) {
      await supabase.from('order_items').insert([
        {
          order_id: orderId,
          product_id: products[0].id,
          quantity: 2,
          unit_price: products[0].price,
          total_price: 40.0
        },
        {
          order_id: orderId,
          product_id: products[1].id,
          quantity: 1,
          unit_price: products[1].price,
          total_price: 80.0
        }
      ])
    }

    // --- 7. Add Notification ---
    await supabase.from('notifications').insert([
      {
        user_id: userIds['customer'],
        title: 'Order Confirmation',
        message: 'Your order ORD001 has been placed successfully.',
        type: 'success',
        related_order_id: orderId
      }
    ])

    console.log('🎉 Seed completed successfully!')
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

seed()
